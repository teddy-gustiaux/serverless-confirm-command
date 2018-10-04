const has = Object.prototype.hasOwnProperty;

class ServerlessConfirmCommand {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.provider = this.serverless.service.provider.name;
        this.options = options;
        this.serverlessLog = serverless.cli.log.bind(serverless.cli);
        this.command = null;
        if (serverless.processedInput.commands.length > 0) {
            [this.command] = serverless.processedInput.commands;
        }
        this.defaultConfiguration = {
            commands: [],
            aws: {
                stages: [],
                commandsForStages: [],
            },
        };
        this.hooks = this.buildHooks();
        this.buildCustomConfiguration();
    }

    buildHooks() {
        return {
            // Before [deploy] (as we do not want the package building to happen before checking)
            'before:package:createDeploymentArtifacts': this.checkConfirmation.bind(this),
            'before:remove:remove': this.checkConfirmation.bind(this),
        };
    }

    buildCustomConfiguration() {
        // Make sure proper configuration exists, or set to default
        const providedConfiguration = has.call(this.serverless.service.custom, 'confirm')
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
        this.serverlessLog('Command confirmed. Proceeding...');
    }

    commandNotConfirmed() {
        throw new this.serverless.classes.Error(
            'Command not confirmed. Use [--confirm] or change the configuration of the plugin.',
        );
    }

    populateStage() {
        this.stage = this.provider === 'aws' ? this.serverless.service.provider.stage : null;
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
