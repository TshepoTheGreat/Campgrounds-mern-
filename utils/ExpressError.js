class ExpressError extends Error{
    constructor(message,status){
        super();
        this.message = message;
        this.name = status;
    }
}

module.exports = ExpressError;