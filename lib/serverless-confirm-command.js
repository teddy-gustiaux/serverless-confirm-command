const ServerlessConfirmCommandError = require('./serverless-confirm-command-error');
const has = Object.prototype.hasOwnProperty;

class ServerlessConfirmCommand {
    constructor(serverless, options) {
        this.options = options;
        this.serverless = serverless;
        this.serverlessLog = serverless.cli.log.bind(serverless.cli);
        this.provider = this.serverless.service.provider.name;
        this.command = null;
        if (serverless.processedInput.commands.length > 0) {
            this.command = serverless.processedInput.commands.join(' ').trim();
        }
        this.msgConfirmed = 'Command confirmed. Proceeding...';
        this.msgNotConfirmed =
            'Command not confirmed. Use [--confirm] or change the configuration of the plugin.';
        this.defaultConfiguration = {
            commands: [],
            aws: {
                stages: [],
                commandsForStages: [],
            },
        };
        this.hooks = {};
        this.buildCustomConfiguration();
        /**
         * Although performing the verification directly in the constructor is not ideal,
         * it ensures that all commands are supported by the plugin.
         *
         * It also bypasses issues due to some internal workarounds of the Serverless Framework
         * with event hooks (such as AWS API keys and usage plans).
         *
         * Therefore, this solution is better than hook bindings
         * for the specific use case of this plugin.
         */
        this.checkConfirmation();
    }

    buildCustomConfiguration() {
        // Make sure proper configuration exists, or set to default
        const hasCustomConfig =
            this.serverless.service.custom !== undefined &&
            has.call(this.serverless.service.custom, 'confirm');
        const providedConfiguration = hasCustomConfig
            ? this.serverless.service.custom.confirm
            : this.defaultConfiguration;
        // AWS-specific configuration
        if (!has.call(providedConfiguration, 'aws')) {
            providedConfiguration.aws = this.defaultConfiguration.aws;
        }
        providedConfiguration.aws = Object.assign(
            this.defaultConfiguration.aws,
            providedConfiguration.aws,
        );
        this.customConfig = Object.assign(this.defaultConfiguration, providedConfiguration);
    }

    mustBeConfirmed() {
        const resultsToCheck = [];
        const commandMustBeConfirmed = this.customConfig.commands.includes(this.command);
        resultsToCheck.push(commandMustBeConfirmed);
        if (this.provider === 'aws') {
            const stageMustBeConfirmed = this.customConfig.aws.stages.includes(this.stage);
            const matchFound = this.customConfig.aws.commandsForStages.find(
                element => element === `${this.command}:${this.stage}`,
            );
            const pairMustBeConfirmed = matchFound !== undefined;
            resultsToCheck.push(stageMustBeConfirmed, pairMustBeConfirmed);
        }
        return resultsToCheck.includes(true);
    }

    commandConfirmed() {
        this.serverlessLog(this.msgConfirmed);
    }

    commandNotConfirmed() {
        this.serverless.classes.Error = ServerlessConfirmCommandError;
        throw new this.serverless.classes.Error(this.msgNotConfirmed);
    }

    populateStage() {
        this.stage = this.provider === 'aws' ? this.serverless.providers.aws.getStage() : null;
    }

    checkConfirmation() {
        this.populateStage();
        if (this.mustBeConfirmed()) {
            if (this.options.confirm) {
                this.commandConfirmed();
            } else {
                this.commandNotConfirmed();
            }
        }
    }
}

module.exports = ServerlessConfirmCommand;
