export default function errorHandler(err, req, res, next) {
  console.error('API error:', err);
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Server error'
  });
}





