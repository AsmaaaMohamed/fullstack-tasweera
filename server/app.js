const express = require('express');
const path = require('path')

const AppError = require('./utils/appError');
const cors = require('cors');

const authRouter = require('./routes/authRoutes');
const appRouter = require('./routes/appRoutes');
const customerRouter = require('./routes/customerRoutes');
const locationRouter = require('./routes/locationRoutes');
const storyRouter = require('./routes/storyRoutes');
const cookiesParser = require('cookie-parser');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
  })); // Allows all origins
app.use(cookiesParser());
app.use(express.json());
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// ROUTES
app.use('/api/location', locationRouter);
app.use('/api/auth', authRouter);
app.use('/api/app', appRouter);
app.use('/api/customer', customerRouter);
app.use('/api/artist/stories', storyRouter);
app.all('/*splat', (req, res, next) => {
    next(new AppError(`This route ${req.originalUrl} is not yet defined!`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
