export const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export const normalizeText = (value, maxLength = 2000) => String(value || '')
  .replace(/\u0000/g, '')
  .trim()
  .slice(0, maxLength);

export const requireFields = (data, fields) => {
  const missing = fields.filter((field) => !normalizeText(data[field], 1));
  return missing;
};

export const escapeWithBreaks = (value = '') => escapeHtml(value).replace(/\n/g, '<br>');

export const safeJson = (res, status, body) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(status).json(body);
};
