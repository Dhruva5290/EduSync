import app from '../server';

export default async function handler(req: any, res: any) {
  try {
    const matchedPath = req.headers['x-matched-path'] || req.headers['x-now-route-matches'];
    if (typeof matchedPath === 'string' && matchedPath.startsWith('/api') && !matchedPath.startsWith('/api/index')) {
      req.url = matchedPath;
    } else if (req.url) {
      if (req.url.startsWith('/api/index/')) {
        req.url = req.url.replace('/api/index/', '/api/');
      } else if (req.url.startsWith('/api/index')) {
        req.url = req.url.replace('/api/index', '/api');
      }
      if (!req.url.startsWith('/api')) {
        req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
      }
    }

    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Error]', err);
    if (typeof res.status === 'function') {
      res.status(500).json({ error: err?.message || 'Serverless error', details: String(err) });
    } else {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err?.message || 'Serverless error' }));
    }
  }
}
