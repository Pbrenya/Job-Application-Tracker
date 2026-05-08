const express = require('express');
const app = express();
const errorHandler = require('./middleware/errorHandler');

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api', require('./routes/notes'));

// Error Handler Middleware
app.use(errorHandler);

module.exports = app;
