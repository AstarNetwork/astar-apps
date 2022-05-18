import { marked } from 'marked';
import { sanitize } from 'dompurify';

export const sanitizeData = (data: string): string => {
  if (data) {
    return sanitize(marked(data));
  }

  return data;
};
