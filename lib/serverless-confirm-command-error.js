class ServerlessConfirmCommandError extends Error {
    constructor(message) {
        const initError = 'Serverless plugin "serverless-confirm-command" initialization errored: ';
        const errorMessage = message.includes(initError)
            ? message.replace(new RegExp(initError), '')
            : message;
        super(errorMessage);
        this.name = this.constructor.name;
        this.message = errorMessage;
        if (!process.env.SLS_DEBUG) this.stack = null;
    }
}

module.exports = ServerlessConfirmCommandError;
