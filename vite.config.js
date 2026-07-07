import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import checkinHandler from './api/checkin.js';

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  if (!rawBody) return {};

  try {
    return JSON.parse(rawBody);
  } catch {
    return {};
  }
}

function checkinApiPlugin() {
  return {
    name: 'm2m-checkin-api',
    configureServer(server) {
      server.middlewares.use('/api/checkin', async (req, res) => {
        req.body = await readJsonBody(req);

        const response = {
          setHeader: res.setHeader.bind(res),
          status(code) {
            res.statusCode = code;
            return this;
          },
          json(payload) {
            if (!res.hasHeader('Content-Type')) {
              res.setHeader('Content-Type', 'application/json');
            }
            res.end(JSON.stringify(payload));
            return this;
          },
        };

        await checkinHandler(req, response);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.RESEND_API_KEY ||= env.RESEND_API_KEY;
  process.env.RESEND_FROM ||= env.RESEND_FROM;
  process.env.RESEND_REPLY_TO ||= env.RESEND_REPLY_TO;

  return {
    plugins: [react(), checkinApiPlugin()],
  };
});
