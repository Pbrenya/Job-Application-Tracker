require('dotenv').config({ path: './server/.env' });
require('dotenv').config({ path: './server/.env' });

jest.mock('./server/middleware/auth', () => (req, res, next) => {
    req.user = { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' }; // Mock user
    next();
});

