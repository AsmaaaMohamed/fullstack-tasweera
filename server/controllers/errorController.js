const AppError = require('./../utils/appError');

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors || {}).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : 'value';
    return new AppError(`${field} already exists: ${value}`, 409);
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let error = { ...err };
    error.name = err.name;
    error.message = err.message;
    error.statusCode = err.statusCode;
    error.status = err.status;
    error.code = err.code;
    error.keyValue = err.keyValue;
    error.errors = err.errors;
    error.isOperational = err.isOperational;

    if (error.name === 'ValidationError') {
        error = handleValidationErrorDB(error);
    }

    if (error.code === 11000) {
        error = handleDuplicateFieldsDB(error);
    }

    if (error.isOperational) {
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    }

    console.error('ERROR', err);

    const response = {
        status: 'error',
        message: 'Something went very wrong!'
    };

    if (process.env.NODE_ENV !== 'production') {
        response.debug = err.message;
    }

    res.status(500).json(response);
};
