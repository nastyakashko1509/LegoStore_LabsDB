export default function errorHandler(err, req, res, next) {
  console.error('API error:', err);
  console.error('Error details:', {
    message: err.message,
    code: err.code,
    detail: err.detail,
    hint: err.hint,
    stack: err.stack
  });
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Server error',
    detail: err.detail || null,
    code: err.code || null
  });
}








