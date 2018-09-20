// External dependencies
const { expect, use } = require('chai');
const dirtyChai = require('dirty-chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
// Local dependencies
const ServerlessConfirmCommand = require('../../src/serverless-confirm-command.js');

use(sinonChai);
use(dirtyChai);

describe('Unit tests of the plugin', () => {
    function buildCustomConfirm(commands, stages, commandsForStages) {
        return {
            confirm: {
                commands,
                stages,
                commandsForStages,
            },
        };
    }

    function buildServerless(processedCommands, stage, custom) {
        return {
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
                    stage,
                },
                custom,
            },
        };
    }

    function constructPlugin(processedCommands, stage, custom) {
        const serverless = buildServerless(processedCommands, stage, custom);
        return new ServerlessConfirmCommand(serverless, {});
    }

    it('should not fail if the configuration is missing', () => {
        const plugin = constructPlugin([], null, {});
        const defaultConfiguration = {
            commands: [],
            stages: [],
            commandsForStages: [],
        };
        expect(plugin.customConfig).to.deep.equal(defaultConfiguration);
    });

    it('should not require confirmation if the configuration is empty', () => {
        const runTestWith = (processedCommands, stage, custom) => {
            const plugin = constructPlugin(processedCommands, stage, custom);
            expect(plugin.mustBeConfirmed()).to.be.false();
        };
        runTestWith(['deploy'], null, {});
        runTestWith(['deploy'], undefined, {});
        runTestWith(['deploy'], '', {});
        runTestWith(['deploy'], [], {});
        runTestWith(['deploy'], {}, {});
        runTestWith(['deploy'], 'dev', {});
        runTestWith(['deploy'], 'prod', {});
        runTestWith(['deploy', 'another'], 'dev', {});
        runTestWith(['another', 'deploy'], 'prod', {});
    });

    it('should require confirmation if the command is listed', () => {
        const setupTestWith = commandList => {
            const runTestWith = (processedCommands, stage, custom) => {
                const plugin = constructPlugin(processedCommands, stage, custom);
                expect(plugin.mustBeConfirmed()).to.be.true();
            };
            const custom = buildCustomConfirm(commandList, [], []);
            runTestWith(['deploy'], null, custom);
            runTestWith(['deploy'], undefined, custom);
            runTestWith(['deploy'], '', custom);
            runTestWith(['deploy'], [], custom);
            runTestWith(['deploy'], {}, custom);
            runTestWith(['deploy'], 'dev', custom);
        };
        setupTestWith(['deploy']);
        setupTestWith(['deploy', 'another']);
        setupTestWith(['another', 'deploy']);
    });

    it('should not require confirmation if the command is not listed', () => {
        const setupTestWith = commandList => {
            const runTestWith = (processedCommands, stage, custom) => {
                const plugin = constructPlugin(processedCommands, stage, custom);
                expect(plugin.mustBeConfirmed()).to.be.false();
            };
            const custom = buildCustomConfirm(commandList, [], []);
            runTestWith(['deploy'], null, custom);
            runTestWith(['deploy'], undefined, custom);
            runTestWith(['deploy'], '', custom);
            runTestWith(['deploy'], [], custom);
            runTestWith(['deploy'], {}, custom);
            runTestWith(['deploy'], 'dev', custom);
        };
        setupTestWith([]);
        setupTestWith(['remove']);
        setupTestWith(['remove', 'another']);
        setupTestWith(['another', 'remove']);
    });

    it('should require confirmation if the stage is listed', () => {
        const setupTestWith = stageList => {
            const runTestWith = (processedCommands, stage, custom) => {
                const plugin = constructPlugin(processedCommands, stage, custom);
                plugin.populateStage();
                expect(plugin.mustBeConfirmed()).to.be.true();
            };
            const custom = buildCustomConfirm([], stageList, []);
            runTestWith([], 'dev', custom);
            runTestWith(['deploy', 'another'], 'dev', custom);
        };
        setupTestWith(['dev']);
        setupTestWith(['dev', 'prod']);
        setupTestWith(['prod', 'dev']);
    });

    it('should not require confirmation if the stage is not listed', () => {
        const setupTestWith = stageList => {
            const runTestWith = (processedCommands, stage, custom) => {
                const plugin = constructPlugin(processedCommands, stage, custom);
                expect(plugin.mustBeConfirmed()).to.be.false();
            };
            const custom = buildCustomConfirm([], stageList, []);
            runTestWith([], 'dev', custom);
            runTestWith(['deploy', 'another'], 'dev', custom);
            runTestWith(['another', 'deploy'], 'dev', custom);
        };
        setupTestWith([]);
        setupTestWith(['prod']);
        setupTestWith(['prod', 'test']);
        setupTestWith(['test', 'prod']);
    });

    it('should require confirmation if the command and stage pair is listed', () => {
        const setupTestWith = commandsForStagesList => {
            const runTestWith = (processedCommands, stage, custom) => {
                const plugin = constructPlugin(processedCommands, stage, custom);
                plugin.populateStage();
                expect(plugin.mustBeConfirmed()).to.be.true();
            };
            const custom = buildCustomConfirm([], [], commandsForStagesList);
            runTestWith(['deploy'], 'prod', custom);
            runTestWith(['deploy', 'another'], 'prod', custom);
        };
        setupTestWith(['deploy:prod']);
        setupTestWith(['deploy:prod', 'deploy:dev']);
        setupTestWith(['deploy:prod', 'remove:dev']);
    });

    it('should not require confirmation if the command and stage pair is not listed', () => {
        const setupTestWith = commandsForStagesList => {
            const runTestWith = (processedCommands, stage, custom) => {
                const plugin = constructPlugin(processedCommands, stage, custom);
                expect(plugin.mustBeConfirmed()).to.be.false();
            };
            const custom = buildCustomConfirm([], [], commandsForStagesList);
            runTestWith(['deploy'], 'dev', custom);
            runTestWith(['deploy', 'another'], 'dev', custom);
            runTestWith(['another', 'deploy'], 'dev', custom);
        };
        setupTestWith(['deploy:prod']);
        setupTestWith(['deploy:prod', 'deploy:test']);
        setupTestWith(['deploy:prod', 'remove:dev']);
    });

    it('should print the proper error if confirmation is required and not provided', () => {
        const runTest = () => {
            const custom = buildCustomConfirm(['deploy'], [], []);
            const plugin = constructPlugin(['deploy'], 'dev', custom);
            plugin.checkConfirmation();
        };
        expect(runTest).to.throw();
    });

    it('should print the proper message if confirmation is required and provided', () => {
        const custom = buildCustomConfirm(['deploy'], [], []);
        const serverless = buildServerless(['deploy'], 'dev', custom);
        const options = { confirm: true };
        const plugin = new ServerlessConfirmCommand(serverless, options);
        const spy = sinon.spy(plugin, 'serverlessLog');
        plugin.checkConfirmation();
        expect(spy).to.have.been.calledOnce();
        spy.restore();
    });

    it('should print nothing if confirmation is not required', () => {
        const custom = buildCustomConfirm([], [], []);
        const plugin = constructPlugin(['deploy'], 'dev', custom);
        const spy = sinon.spy(plugin, 'serverlessLog');
        plugin.checkConfirmation();
        expect(spy).to.not.have.been.called();
        spy.restore();
    });
});
