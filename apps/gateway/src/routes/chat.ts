import { Router } from 'express';
import { browser_stream_invoke } from '@browserclaw/core/agents'
import { getConfigPath } from '@browserclaw/core/fileManager';
import fs from 'fs/promises';
import path from 'path';
const configDir = getConfigPath();
const configFilePath = path.join(configDir, 'model.json');



const router = Router();
router.get('/', (req, res) => {
  res.json({ status: "OK" });
});

router.get('/stream', async (req, res) => {
  try {
    const query = req.query.query as string;
    const thread_id = req.query.thread_id as string;
    
    if (!query || !thread_id) {
      return res.status(400).json({ error: "Missing query or thread_id" });
    }

    const configContent = await fs.readFile(configFilePath, 'utf-8');
    const config = JSON.parse(configContent);
    const modelConfig = config.defaultModel;

    if (!modelConfig) {
      return res.status(500).json({ error: "defaultModel not found in config" });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = browser_stream_invoke(query, thread_id, modelConfig);

    for await (const chunk of stream) {
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    console.error("Stream error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.end();
    }
  }
});

export default router;
