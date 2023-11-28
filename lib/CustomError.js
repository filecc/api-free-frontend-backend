class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = CustomError;

class CustomErrorValidation extends Error {
    constructor(message, statusCode, array) {
        super(message);
        this.statusCode = statusCode;
        this.array = array
    }
}

module.exports = CustomErrorValidation;