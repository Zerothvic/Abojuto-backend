
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error(`[ERROR] ${err.message}`);

  // Use error status if set, otherwise default to 500
  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only show stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
