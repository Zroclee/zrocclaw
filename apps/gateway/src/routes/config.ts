import { Router } from 'express';
import { getConfigPath } from '@browserclaw/core';

const router = Router({

});

router.get('/', (req, res) => {
  res.json({ configPath: getConfigPath()});
});

export default router;