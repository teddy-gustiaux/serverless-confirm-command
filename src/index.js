class ServerlessConfirmCommand {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options;

        this.serverlessLog = serverless.cli.log.bind(serverless.cli);
        this.command = null;
        if (serverless.processedInput.commands.length > 0) {
            [this.command] = serverless.processedInput.commands;
        }
        this.stage = serverless.service.provider.stage;

        const defaultConfiguration = {
            commands: [],
            stages: [],
            commandsForStages: [],
        };
        this.customConfig = Object.assign(defaultConfiguration, serverless.service.custom.confirm);

        this.hooks = {
            // Before [deploy] (as we do not want the package building to happen before checking)
            'before:package:createDeploymentArtifacts': this.checkConfirmation.bind(this),
            'before:remove:remove': this.checkConfirmation.bind(this),
        };
    }

    mustBeConfirmed() {
        const commandMustBeConfirmed = this.customConfig.commands.includes(this.command);
        const stageMustBeConfirmed = this.customConfig.stages.includes(this.stage);
        const matchFound = this.customConfig.commandsForStages.find(
            element => element === `${this.command}:${this.stage}`,
        );
        const pairMustBeConfirmed = matchFound !== undefined;
        return commandMustBeConfirmed || stageMustBeConfirmed || pairMustBeConfirmed;
    }

    deploymentConfirmed() {
        this.serverlessLog('Deployment confirmed. Proceeding...');
    }

    deploymentNotConfirmed() {
        throw new this.serverless.classes.Error(
            'Deployment not confirmed. Use [--confirm] or change the configuration of the plugin.',
        );
    }

    checkConfirmation() {
        if (this.mustBeConfirmed()) {
            if (this.options.confirm === true) {
                this.deploymentConfirmed();
            } else {
                this.deploymentNotConfirmed();
            }
        }
    }
}

module.exports = ServerlessConfirmCommand;
