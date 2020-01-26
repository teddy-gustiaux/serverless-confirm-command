// Local dependencies
const ServerlessConfirmCommand = require('../../lib/serverless-confirm-command.js');

module.exports = {
    serverlessProviders: [
        'aws',
        'google',
        'azure',
        'openwhisk',
        'kubeless',
        'fn',
        'cloudflare',
        'spotinst',
        'webtasks',
        'knative',
    ],

    msgConfirmed: 'Command confirmed. Proceeding...',

    msgNotConfirmed:
        'Command not confirmed. Use [--confirm] or change the configuration of the plugin.',

    buildCustomConfirm(commands, stages, commandsForStages) {
        return {
            confirm: {
                commands,
                aws: {
                    stages,
                    commandsForStages,
                },
            },
        };
    },

    buildServerless(processedCommands, stage, custom, provider) {
        const serverlessObject = {
            processedInput: {
                commands: processedCommands,
                options: {
                    stage,
                },
            },
            cli: {
                log(params) {
                    return params;
                },
                consoleLog(params) {
                    return params;
                },
            },
            classes: {
                Error: class extends Error {},
            },
            service: {
                provider: {
                    name: provider,
                    stage,
                },
                custom,
            },
        };
        if (provider === 'aws') {
            serverlessObject.providers = {
                aws: {
                    getStage() {
                        return stage;
                    },
                },
            };
        }
        return serverlessObject;
    },

    constructPlugin(processedCommands, stage, custom, provider) {
        const serverless = this.buildServerless(processedCommands, stage, custom, provider);
        return new ServerlessConfirmCommand(serverless, {});
    },

    testWithProvider(testFunction, provider, params) {
        const args = params.concat(provider);
        testFunction(...args);
    },

    testWithAllProviders(testFunction, params) {
        this.serverlessProviders.forEach(provider => {
            this.testWithProvider(testFunction, provider, params);
        });
    },
};
