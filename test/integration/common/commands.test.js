// External dependencies
const { expect, use } = require('chai');
const { spawnSync } = require('child_process');
const dirtyChai = require('dirty-chai');

use(dirtyChai);

describe('Integration tests of the plugin - using commands only', () => {
    const folder = 'commands';
    const pathToServerlessFramework = '../../../../node_modules/serverless/bin/serverless';

    it('should indicate the command as not confirmed if the option is not provided', () => {
        const subprocess = spawnSync('node', [pathToServerlessFramework, 'deploy function'], {
            cwd: `${__dirname}/${folder}`,
        });
        const stdout = subprocess.stdout.toString('utf-8');
        const notConfirmed = stdout.includes('Command not confirmed.');
        const serverlessError = stdout.includes('Serverless Error');
        expect(notConfirmed).to.be.true();
        expect(serverlessError).to.be.true();
    }).timeout(5000);

    it('should indicate the command as confirmed if the option is provided', () => {
        const subprocess = spawnSync(
            'node',
            [pathToServerlessFramework, 'deploy function', '--confirm'],
            {
                cwd: `${__dirname}/${folder}`,
            },
        );
        const stdout = subprocess.stdout.toString('utf-8');
        const confirmed = stdout.includes('Command confirmed.');
        const serverlessError = stdout.includes('Serverless Error');
        expect(confirmed).to.be.true();
        expect(serverlessError).to.be.true();
    }).timeout(5000);

    it('should not do anything if the command does not require confirmation', () => {
        const subprocess = spawnSync('node', [pathToServerlessFramework, 'deploy'], {
            cwd: `${__dirname}/${folder}`,
        });
        const stdout = subprocess.stdout.toString('utf-8');
        const confirmed = stdout.includes('Command confirmed.');
        const notConfirmed = stdout.includes('Command not confirmed.');
        const serverlessError = stdout.includes('Serverless Error');
        expect(notConfirmed).to.be.false();
        expect(confirmed).to.be.false();
        expect(serverlessError).to.be.true();
    }).timeout(5000);
});
