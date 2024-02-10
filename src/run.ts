import cp from 'child_process';
import * as path from 'path';
import * as core from '@actions/core';
import * as io from '@actions/io';
import { getNebulactl } from './nebulactl';
import { Error, isError } from './error';

export async function run(): Promise<void> {
    try {
        const result = await runSetup()
        if (result !== null && isError(result)) {
            core.setFailed(result.message);
        }
    } catch (error) {
        // In case we ever fail to catch an error
        // in the call chain, we catch the error
        // and mark the build as a failure. The
        // user is otherwise prone to false positives.
        if (isError(error)) {
            core.setFailed(error.message);
            return;
        }
        core.setFailed('Internal error');
    }
}

// runSetup runs the nebulactl-setup action, and returns
// a non-empty error if it fails.
async function runSetup(): Promise<null|Error> {
    const version = core.getInput('version');
    if (version === '') {
        return {
            message: 'a version was not provided'
        };
    }

    core.info(`Setting up nebulactl version "${version}"`);
    const installDir = await getNebulactl(version);
    if (isError(installDir)) {
        return installDir
    }

    core.info('Adding nebulactl binary to PATH');
    core.addPath(path.join(installDir));
    const binaryPath = await io.which('nebulactl', true);
    if (binaryPath === '') {
        return {
            message: 'nebulactl was not found on PATH'
        };
    }

    core.info(`Successfully setup nebulactl version ${version}`);

    return null;
}