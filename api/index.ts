import app from '../server';

export default function handler(req: any, res: any) {
  // 1. Recover original request URL if rewritten by Vercel
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
}
