const express = require('express');
const cors = require('cors');
const app = express();
const errorHandler = require('./middleware/errorHandler');

// Init Middleware
app.use(cors({ origin: 'https://yourdomain.com' }));
app.use(express.json({ extended: false }));

// Simple health check for the root route
app.get('/', (req, res) => {
	res.status(200).send('API is active');
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api', require('./routes/notes'));
app.use('/api/analytics', require('./routes/analytics'));

// Error Handler Middleware
app.use(errorHandler);

module.exports = app;
