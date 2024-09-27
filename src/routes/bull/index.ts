import { bullBoard } from '@services/bullmq';
import { RequestHandler, Router } from 'express';

const router = Router();
router.use('/', bullBoard.router as RequestHandler);

export default router;