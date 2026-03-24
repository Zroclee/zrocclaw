// src/server.ts
import app from './app';

const PORT = 18302;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Gateway is running at http://127.0.0.1:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});