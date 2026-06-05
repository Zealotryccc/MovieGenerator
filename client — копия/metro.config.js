const { getDefaultConfig } = require('expo/metro-config');
const http = require('http');

const config = getDefaultConfig(__dirname);

const API_TARGET = process.env.EXPO_API_PROXY_TARGET ?? 'http://127.0.0.1:8000';

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url?.startsWith('/movie_generator')) {
        const target = new URL(API_TARGET);
        const proxy = http.request(
          {
            hostname: target.hostname,
            port: target.port || (target.protocol === 'https:' ? 443 : 80),
            path: req.url,
            method: req.method,
            headers: {
              ...req.headers,
              host: target.host,
            },
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
            proxyRes.pipe(res);
          },
        );
        proxy.on('error', () => {
          res.statusCode = 502;
          res.end('API proxy error: is Django running on ' + API_TARGET + '?');
        });
        if (req.method === 'GET' || req.method === 'HEAD') {
          proxy.end();
        } else {
          req.pipe(proxy);
        }
        return;
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
