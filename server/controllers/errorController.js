const AppError = require('./../utils/appError');

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    // res.status(err.statusCode).json({
    //     status: err.status,
    //     error:err,
    //     message:err.message,
    //     stack:err.stack
    // });
    let error = { ...err };
    error.name = err.name; // Fix: Copy non-enumerable property 'name'
    error.message = err.message;
    if (error.name === 'ValidationError') {
        error = handleValidationErrorDB(error);
    }
    // Operational, trusted error: send message to client
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });

        // Programming or other unknown error: don't leak error details
    } else {
        // 1) Log error

        console.error('ERROR 💥', err);

        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
}