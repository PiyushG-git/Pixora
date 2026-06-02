const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return 400 Bad Request if validation fails
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = validateRequest;
