import express from 'express';
import { analyzeATS } from '../controllers/ats.controller.js';

const router = express.Router();

router.post('/analyze', analyzeATS);

export default router;