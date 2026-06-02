const { body } = require('express-validator');
const validateRequest = require('../middlewares/validation.middleware');

const updateProfileValidator = [
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 150 }).withMessage('Bio cannot exceed 150 characters'),
    validateRequest
];

module.exports = {
    updateProfileValidator
};
