import express from 'express';
import {
  generateSummaryController,
  generateBulletsController,
} from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/generate-summary', generateSummaryController);
router.post('/generate-bullets', generateBulletsController);

export default router;