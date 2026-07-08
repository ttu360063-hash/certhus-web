# TODO: criar Edge Function `upload-project-media` no Supabase

## Frontend já está pronto para chamar
- `POST https://lmcbmdijvkswnrjrjmvy.supabase.co/functions/v1/upload-project-media`
- Payload esperado no front (`saveProject()`):
  - action: `create` | `update`
  - id: uuid ou null
  - name, subtitle, description, icon, color
  - tags: array de strings
  - images: array de DataURL (image/*)
  - videos: array de DataURL (video/mp4)
  - cover_idx: number (índice da capa dentro de images)
  - cover_url: pode ser ignorado

- Payload esperado no delete (`deleteProject()`):
  - { action: 'delete', id }

## O que falta no Supabase
- Criar bucket `project-media`
- Criar tabela `projects`
  - campos esperados: id, name, subtitle, description, icon, color, tags, cover_url, image_urls, video_urls, created_at, updated_at
- Habilitar RLS
  - SELECT liberado publicamente
  - INSERT/UPDATE/DELETE apenas para serviço da Edge Function (por exemplo via `auth.uid()` de service role no backend, ou policy usando `service_role`/JWT do Supabase)
- Criar Edge Function `upload-project-media` e dar deploy

## Função (contrato)
- Requisitos de CORS:
  - Responder OPTIONS com status 204 e headers:
    - Access-Control-Allow-Origin: `*` (ou seu domínio)
    - Access-Control-Allow-Methods: `POST, OPTIONS`
    - Access-Control-Allow-Headers: `authorization, content-type`
- A função deve:
  1) Decodificar `images[]`/`videos[]` DataURLs
  2) Enviar arquivos para Supabase Storage bucket `project-media`
     - Paths sugeridos: `projects/<projectId>/<images|videos>/<index>.<ext>`
  3) Montar URLs públicas:
     - cover_url = image_urls[cover_idx] (ou first image)
  4) Salvar/atualizar registro em `projects` com image_urls/video_urls/tags
  5) Para delete: remover arquivos do Storage (tudo do projectId) e apagar registro

## Observações
- Após deploy, o front deve conseguir salvar sem 404 e sem falha de preflight CORS.

