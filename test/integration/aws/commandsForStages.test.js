// External dependencies
const { expect, use } = require('chai');
const { spawn, spawnSync } = require('child_process');
const dirtyChai = require('dirty-chai');

use(dirtyChai);

describe('Integration tests of the plugin - using command and AWS stage pairs', () => {
    const folder = 'commandsForStages';
    const pathToServerlessFramework = '../../../../node_modules/serverless/bin/serverless';

    it('should indicate the command as not confirmed if the option is not provided', () => {
        const subprocess = spawnSync(
            'node',
            [pathToServerlessFramework, 'deploy function', '--stage', 'prod'],
            { cwd: `${__dirname}/${folder}` },
        );
        const stdout = subprocess.stdout.toString('utf-8');
        const notConfirmed = stdout.includes('Command not confirmed.');
        const pluginCustomError = stdout.includes('Serverless Confirm Command Error');
        const serverlessDefaultErrorMessage = stdout.includes('initialization errored');
        expect(notConfirmed).to.be.true();
        expect(pluginCustomError).to.be.true();
        expect(serverlessDefaultErrorMessage).to.be.false();
    }).timeout(10000);

    it('should indicate the command as not confirmed if the option is not provided and debug mode is enabled', () => {
        const environmentVariables = { ...process.env };
        environmentVariables.SLS_DEBUG = '*';
        const subprocess = spawnSync(
            'node',
            [pathToServerlessFramework, 'deploy function', '--stage', 'prod'],
            { cwd: `${__dirname}/${folder}`, env: environmentVariables },
        );
        const stdout = subprocess.stdout.toString('utf-8');
        const notConfirmed = stdout.includes('Command not confirmed.');
        const pluginCustomError = stdout.includes('Serverless Confirm Command Error');
        const serverlessDefaultErrorMessage = stdout.includes('initialization errored');
        expect(notConfirmed).to.be.true();
        expect(pluginCustomError).to.be.true();
        expect(serverlessDefaultErrorMessage).to.be.false();
    }).timeout(10000);

    it('should indicate the command as confirmed if the option is provided', () => {
        const subprocess = spawnSync(
            'node',
            [pathToServerlessFramework, 'deploy function', '--stage', 'prod', '--confirm'],
            { cwd: `${__dirname}/${folder}` },
        );
        const stdout = subprocess.stdout.toString('utf-8');
        const confirmed = stdout.includes('Command confirmed.');
        const pluginCustomError = stdout.includes('Serverless Confirm Command Error');
        expect(confirmed).to.be.true();
        expect(pluginCustomError).to.be.false();
    }).timeout(10000);

    it('should not do anything if the command does not require confirmation', done => {
        const subprocess = spawn('node', [pathToServerlessFramework, 'print'], {
            cwd: `${__dirname}/${folder}`,
            timeout: 5000,
        });
        let stdout;
        subprocess.stdout.on('data', data => {
            stdout = `${stdout} ${data}`;
        });
        subprocess.on('close', exitCode => {
            const confirmed = stdout.includes('Command confirmed.');
            const notConfirmed = stdout.includes('Command not confirmed.');
            const pluginCustomError = stdout.includes('Serverless Confirm Command Error');
            expect(exitCode).to.equal(0);
            expect(notConfirmed).to.be.false();
            expect(confirmed).to.be.false();
            expect(pluginCustomError).to.be.false();
            done();
        });
    }).timeout(10000);
});
