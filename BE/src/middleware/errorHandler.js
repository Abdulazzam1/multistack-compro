module.exports = (err, req, res, _next) => {
  console.error('[ERROR]', err.stack || err.message);

  const status  = err.status || 500;
  const message = status === 500
    ? 'Terjadi kesalahan internal server.'
    : err.message;

  res.status(status).json({ success: false, message });
};
