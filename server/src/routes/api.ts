import { Router, Request, Response } from 'express';
import {
  analyzeImage,
  suggestSchedule,
  chatWithAI,
  estimateTaskDuration
} from '../services/geminiService.js';
import { getProviderInfo, isAIAvailable } from '../services/unifiedAIService.js';
import {
  validateAnalyzeImage,
  validateSuggestSchedule,
  validateChat,
  validateEstimateDuration
} from '../middleware/validation.js';

const router = Router();

// GET /api/provider-info
router.get('/provider-info', (req: Request, res: Response) => {
  try {
    const info = getProviderInfo();
    res.json({
      success: true,
      data: info
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get provider info'
    });
  }
});

// POST /api/analyze-image
router.post('/analyze-image', validateAnalyzeImage, async (req: Request, res: Response) => {
  try {
    const { image } = req.body;

    const result = await analyzeImage(image);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error in /api/analyze-image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze image'
    });
  }
});

// POST /api/suggest-schedule
router.post('/suggest-schedule', validateSuggestSchedule, async (req: Request, res: Response) => {
  try {
    const { tasks, existingEvents, currentDate } = req.body;

    const result = await suggestSchedule(tasks, existingEvents, currentDate);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error in /api/suggest-schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to suggest schedule'
    });
  }
});

// POST /api/chat
router.post('/chat', validateChat, async (req: Request, res: Response) => {
  try {
    const { messages, tasks, events, currentDate } = req.body;

    const result = await chatWithAI(messages, tasks, events, currentDate);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process chat'
    });
  }
});

// POST /api/estimate-duration
router.post('/estimate-duration', validateEstimateDuration, async (req: Request, res: Response) => {
  try {
    const { taskTitle } = req.body;

    const result = await estimateTaskDuration(taskTitle);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error in /api/estimate-duration:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to estimate duration'
    });
  }
});

export default router;
