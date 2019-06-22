// External dependencies
const { expect, use } = require('chai');
const { spawn } = require('child_process');
const dirtyChai = require('dirty-chai');

use(dirtyChai);

describe('Integration tests of the plugin - when no configuration is setup', () => {
    const folder = 'noConfiguration';
    const pathToServerlessFramework = '../../../../node_modules/serverless/bin/serverless';

    it('should not do anything if the configuration is missing', done => {
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

    it('should not do anything if no command is run', done => {
        const subprocess = spawn('node', [pathToServerlessFramework], {
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
