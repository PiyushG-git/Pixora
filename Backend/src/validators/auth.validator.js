const { body } = require('express-validator');
const validateRequest = require('../middlewares/validation.middleware');

const registerValidator = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 150 }).withMessage('Bio cannot exceed 150 characters'),
    validateRequest
];

const loginValidator = [
    // Either email or username should be provided
    body().custom((value, { req }) => {
        if (!req.body.email && !req.body.username) {
            throw new Error('Either email or username is required');
        }
        return true;
    }),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validateRequest
];

module.exports = {
    registerValidator,
    loginValidator
};
