import app from '../server';

export default function handler(req: any, res: any) {
  // Normalize req.url so Express router matches regardless of how Vercel routes the subpath
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
