export default (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err) {
    console.error(err.stack);
    res.sendStatus(500);
  }
}