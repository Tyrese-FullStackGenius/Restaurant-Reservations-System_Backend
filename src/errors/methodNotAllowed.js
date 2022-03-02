function methodNotAllowed(req, res, next) {
    next({
        status: 405,
        message: `${request.method} not allowed for ${request.originalUrl}`
    });
}

module.exports = methodNotAllowed;