export default async function handler(req, res) {
  // Configuração do CORS para permitir que o front-end acesse a API
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { html, password } = req.body;

  if (!password || password !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid password' });
  }

  if (!html) {
    return res.status(400).json({ error: 'Missing HTML content' });
  }

  const owner = 'ttu360063-hash';
  const repo = 'certhus-web';
  const path = 'index.html';
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'GitHub token not configured on server (GITHUB_TOKEN env var missing)' });
  }

  try {
    // 1. Get current file SHA from GitHub
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Certhus-Headless-CMS'
      }
    });

    if (!getRes.ok) {
      const errorData = await getRes.json();
      return res.status(getRes.status).json({ error: 'Failed to fetch current file from GitHub', details: errorData });
    }

    const fileData = await getRes.json();
    const sha = fileData.sha;

    // 2. Encode new content in Base64 (handling utf-8 properly for Brazilian Portuguese accents)
    const encodedContent = Buffer.from(html, 'utf-8').toString('base64');

    // 3. Update file on GitHub
    const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Certhus-Headless-CMS'
      },
      body: JSON.stringify({
        message: 'Update index.html via Visual CMS',
        content: encodedContent,
        sha: sha
      })
    });

    if (!updateRes.ok) {
       const errorData = await updateRes.json();
       return res.status(updateRes.status).json({ error: 'Failed to update file on GitHub', details: errorData });
    }

    return res.status(200).json({ success: true, message: 'File updated successfully' });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
