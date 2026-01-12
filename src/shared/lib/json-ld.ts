import sanitizeHtml from 'sanitize-html';

const jsonLdSanitizeOptions = {
  allowedTags: [],       // No HTML tags allowed
  allowedAttributes: {}, // No HTML attributes allowed
  // Custom text filter to escape < and > characters
  textFilter: (text: string) => text.replace(/</g, '\u003c').replace(/>/g, '\u003e'),
};

export const sanitizeJsonLd = <T extends any>(data: T): T => {
  if (typeof data === 'string') {
    // Apply sanitizeHtml to string data with strict options
    return sanitizeHtml(data, jsonLdSanitizeOptions) as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeJsonLd(item)) as T;
  }

  if (typeof data === 'object' && data !== null) {
    const sanitizedData = {} as T;

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedData[key as keyof T] = sanitizeJsonLd(data[key]);
      }
    }

    return sanitizedData;
  }

  return data;
};