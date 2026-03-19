import { Router } from 'express';
import { getConfigPath } from '@browserclaw/core/fileManager';
import { PlaywrightManager } from '@browserclaw/core/playwright';

const router = Router({

});

router.get('/', (req, res) => {
  res.json({ configPath: getConfigPath()});
});

router.get('/playwright', async (req, res) => {
  const page = await PlaywrightManager.getInstance().getPage();
  res.json({ playwrightPath: "启动playwright成功" });
});

export default router;