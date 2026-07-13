/*
  Edge Function: upload-project-media
  - Admin-only (verificação simples via admin secret no payload/ header)
  - CORS support for OPTIONS preflight

  IMPORTANTE:
  - Este projeto está usando o frontend puro (sem SDK client).
  - A função recebe:
    { action: 'create'|'update', id?: any, name, subtitle, description, icon, color, tags: string[], images: DataURL[], videos: DataURL[], cover_idx?: number }
    ou { action: 'delete', id }
*/

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type AnyRecord = Record<string, any>;

const ALLOW_ORIGIN = "https://certhusweb.vercel.app";

function addCorsHeaders(_req: Request, headers?: HeadersInit) {
  return {
    ...(headers || {}),
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Max-Age": "86400",
  };
}





function jsonResponse(req: Request, body: unknown, status = 200) {

  return new Response(JSON.stringify(body), {
    status,
    headers: addCorsHeaders(req, {
      "Content-Type": "application/json; charset=utf-8",
    }),
  });
}

function decodeDataUrl(dataUrl: string): { mime: string; bytes: Uint8Array } {
  const match = /^data:(.+?);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Invalid data URL");
  const mime = match[1];
  const b64 = match[2];
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return { mime, bytes };
}

function extFromMime(mime: string) {
  if (mime.includes("jpeg")) return "jpg";
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";

  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("webm")) return "webm";

  return "bin";
}

serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("", {
        status: 204,
        headers: addCorsHeaders(req),
      });
    }

    if (req.method !== "POST") {
      return jsonResponse(req, { error: "Method not allowed" }, 405);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return jsonResponse(req, { error: "Missing env vars (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)" }, 500);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return jsonResponse(req, { error: "Invalid JSON payload" }, 400);
    }

    const action = payload?.action;

    // Admin-only enforcement (shared secret in header)
    const authz = req.headers.get("authorization") || "";
    const expected = Deno.env.get("ADMIN_AUTH_TOKEN") ?? "";
    if (expected) {
      if (!authz.includes(expected)) {
        return jsonResponse(req, { error: "Unauthorized" }, 401);
      }
    }

    if (action === "delete") {
      const id = payload?.id;
      if (!id) return jsonResponse(req, { error: "Missing id" }, 400);

      const bucket = "project-media";
      const prefix = `projects/${id}/`;

      const { data: objects, error: listErr } = await supabase.storage
        .from(bucket)
        .list(prefix, { limit: 1000 });

      if (!listErr && Array.isArray(objects)) {
        for (const obj of objects) {
          if (obj?.name) {
            const path = `${prefix}${obj.name}`;
            try {
              await supabase.storage.from(bucket).remove([path]);
            } catch {
              // best-effort
            }
          }
        }
      }

      const { error: delErr } = await supabase.from("projects").delete().eq("id", id);
      if (delErr) return jsonResponse(req, { error: delErr.message }, 500);

      return jsonResponse(req, { ok: true });
    }

    if (action !== "create" && action !== "update") {
      return jsonResponse(req, { error: "Invalid action" }, 400);
    }

    const id = payload?.id ?? crypto.randomUUID();

    const name = payload?.name ?? "";
    const subtitle = payload?.subtitle ?? "";
    const description = payload?.description ?? "";
    const icon = payload?.icon ?? "";
    const color = payload?.color ?? "";
    const tags: string[] = Array.isArray(payload?.tags) ? payload.tags : [];
    const cover_idx = typeof payload?.cover_idx === "number" ? payload.cover_idx : 0;

    const images: string[] = Array.isArray(payload?.images) ? payload.images : [];
    const videos: string[] = Array.isArray(payload?.videos) ? payload.videos : [];

    const bucket = "project-media";

    const image_urls: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const dataUrl = images[i];
      if (typeof dataUrl !== "string") continue;

      const { mime, bytes } = decodeDataUrl(dataUrl);
      const ext = extFromMime(mime);
      const path = `projects/${id}/images/${i}.${ext}`;

      const { error: upErr } = await supabase.storage.from(bucket).upload(path, bytes, {
        contentType: mime,
        upsert: true,
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      image_urls.push(pub.publicUrl);
    }

    const video_urls: string[] = [];
    for (let i = 0; i < videos.length; i++) {
      const dataUrl = videos[i];
      if (typeof dataUrl !== "string") continue;

      const { mime, bytes } = decodeDataUrl(dataUrl);
      const ext = extFromMime(mime);
      const path = `projects/${id}/videos/${i}.${ext}`;

      const { error: upErr } = await supabase.storage.from(bucket).upload(path, bytes, {
        contentType: mime,
        upsert: true,
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      video_urls.push(pub.publicUrl);
    }

    const cover_url = image_urls[cover_idx] ?? image_urls[0] ?? null;

    const row: AnyRecord = {
      id,
      name,
      subtitle,
      description,
      icon,
      color,
      tags,
      cover_url,
      image_urls,
      video_urls,
      updated_at: new Date().toISOString(),
    };

    if (action === "create") {
      row.created_at = new Date().toISOString();
      const { error: insErr } = await supabase.from("projects").insert(row);
      if (insErr) {
        const { error: upErr } = await supabase.from("projects").upsert({ ...row }, { onConflict: "id" });
        if (upErr) return jsonResponse(req, { error: upErr.message }, 500);
      }
    } else {
      const { error: upErr } = await supabase.from("projects").upsert({ ...row }, { onConflict: "id" });
      if (upErr) return jsonResponse(req, { error: upErr.message }, 500);
    }

    return jsonResponse(req, { ok: true, id });
  } catch (e: any) {
    // Always return CORS headers even on unexpected errors
    try {
      return jsonResponse(req, { error: e?.message ?? String(e) }, 500);
    } catch {
      return new Response(JSON.stringify({ error: e?.message ?? String(e) }), {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": ALLOW_ORIGIN,
        },
      });
    }
  }
});

