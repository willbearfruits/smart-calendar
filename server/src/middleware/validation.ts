import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateAnalyzeImage = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    image: Joi.string().required().min(100)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: `Validation error: ${error.details[0].message}`
    });
  }

  next();
};

export const validateSuggestSchedule = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    tasks: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        title: Joi.string().required(),
        completed: Joi.boolean().required()
      })
    ).required(),
    existingEvents: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        title: Joi.string().required(),
        dayOfWeek: Joi.number().min(0).max(6),
        date: Joi.string(),
        time: Joi.string(),
        type: Joi.string().valid('work', 'personal', 'deadline', 'other').required(),
        calendarId: Joi.string().required()
      })
    ).required(),
    currentDate: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: `Validation error: ${error.details[0].message}`
    });
  }

  next();
};

export const validateChat = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    messages: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        role: Joi.string().valid('user', 'assistant').required(),
        content: Joi.string().required()
      })
    ).required().min(1),
    tasks: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        title: Joi.string().required(),
        completed: Joi.boolean().required()
      })
    ).required(),
    events: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        title: Joi.string().required(),
        type: Joi.string().required()
      })
    ).required(),
    currentDate: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: `Validation error: ${error.details[0].message}`
    });
  }

  next();
};

export const validateEstimateDuration = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    taskTitle: Joi.string().required().min(1).max(500)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: `Validation error: ${error.details[0].message}`
    });
  }

  next();
};
