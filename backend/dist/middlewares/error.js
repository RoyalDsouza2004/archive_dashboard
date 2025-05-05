export const errorMiddleware = (err, req, res, next) => {
    if (err.code === "ER_DUP_ENTRY" || err.errno === 1062) {
        err.message = "Duplicate entry. This value already exists.";
        err.statusCode = 400;
    }
    err.message || (err.message = "Internal Server Error");
    err.statusCode || (err.statusCode = 500);
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
export const TryCatch = (func) => async (req, res, next) => {
    try {
        await func(req, res, next);
    }
    catch (error) {
        next(error);
    }
};
