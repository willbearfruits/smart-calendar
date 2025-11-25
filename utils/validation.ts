// Validation utilities for user inputs

export const validateEventTitle = (title: string): { valid: boolean; error?: string } => {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Event title is required' };
  }
  if (title.length > 100) {
    return { valid: false, error: 'Event title must be less than 100 characters' };
  }
  return { valid: true };
};

export const validateTaskTitle = (title: string): { valid: boolean; error?: string } => {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Task title is required' };
  }
  if (title.length > 200) {
    return { valid: false, error: 'Task title must be less than 200 characters' };
  }
  return { valid: true };
};

export const validateDate = (dateStr: string): { valid: boolean; error?: string } => {
  if (!dateStr) {
    return { valid: false, error: 'Date is required' };
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  return { valid: true };
};

export const validateDayOfWeek = (day: number): { valid: boolean; error?: string } => {
  if (day < 0 || day > 6) {
    return { valid: false, error: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' };
  }
  return { valid: true };
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid image file (JPEG, PNG, or WebP)' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 10MB' };
  }

  return { valid: true };
};

export const validateTime = (timeStr: string): { valid: boolean; error?: string } => {
  if (!timeStr || timeStr.trim().length === 0) {
    return { valid: true }; // Time is optional
  }

  // Very permissive - just check it's not too long
  if (timeStr.length > 50) {
    return { valid: false, error: 'Time string is too long' };
  }

  return { valid: true };
};
