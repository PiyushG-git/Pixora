const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        return res.status(400).json({
            message: "Duplicate key error",
            error: err
        });
    }

    // Default error
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
    });
};

module.exports = errorHandler;
