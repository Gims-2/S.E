import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', os: 'KoreOS', uptime: process.uptime() });
});

// In production, serve the built static assets from dist
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'), err => {
    if (err) {
      // If dist hasn't been built yet or file not found
      res.sendFile(path.resolve(__dirname, 'index.html'));
    }
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`KoreOS server running on port ${PORT}`);
});
