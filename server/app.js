const express = require('express');
const path = require('path')

const AppError = require('./utils/appError');
const cors = require('cors');

const authRouter = require('./routes/authRoutes');
const locationRouter = require('./routes/locationRoutes');
const cookiesParser = require('cookie-parser');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(cors({
    origin: 'http://localhost:3001', // your frontend
    credentials: true
  })); // Allows all origins
app.use(cookiesParser());
app.use(express.json());
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// ROUTES
app.use('/api/location', locationRouter);

app.all('/*splat', (req, res, next) => {
    next(new AppError(`This route ${req.originalUrl} is not yet defined!`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
