
import * as os from 'os';
import * as path from 'path';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import { Octokit } from "@octokit/core";
import { Error, isError } from './error';

// versionPrefix is used in Github release names, and can
// optionally be specified in the action's version parameter.
const versionPrefix = "v";

export async function getNebulactl(version: string): Promise<string|Error> {
  const binaryPath = tc.find('nebulactl', version, os.arch());
  if (binaryPath !== '') {
    core.info(`Found in cache @ ${binaryPath}`);
    return binaryPath;
  }

  core.info(`Resolving the download URL for the current platform...`);
  const downloadURL = await getDownloadURL(version);
  if (isError(downloadURL)) {
      return downloadURL
  }

  core.info(`Downloading nebulactl version "${version}" from ${downloadURL}`);
  const downloadPath = await tc.downloadTool(downloadURL);
  core.info(`Successfully downloaded nebulactl version "${version}" from ${downloadURL}`);

  core.info('Extracting nebulactl...');
  const extractPath = await tc.extractTar(downloadPath);
  core.info(`Successfully extracted nebulactl to ${extractPath}`);

  core.info('Adding nebulactl to the cache...');
  const cacheDir = await tc.cacheDir(
    path.join(extractPath),
    'nebulactl',
    version,
    os.arch()
  );
  core.info(`Successfully cached nebulactl to ${cacheDir}`);

  return cacheDir;
}

// getDownloadURL resolves nebulactl's Github download URL for the
// current architecture and platform.
async function getDownloadURL(version: string): Promise<string|Error> {
  let architecture = '';
  switch (os.arch()) {
    case 'x64':
      architecture = 'x86_64';
      break;
    default:
      return {
        message: `The "${os.arch()}" architecture is not supported with a nebulactl release.`
      };
  }
  let platform = '';
  switch (os.platform()) {
    case 'linux':
      platform = 'Linux';
      break;
    default:
      return {
        message: `The "${os.platform()}" platform is not supported with a nebulactl release.`
      };
  }

  const assetName = `nebulactl_${platform}_${architecture}.tar.gz`
  const octokit = new Octokit();
  const {data: releases} = await octokit.request(
    'GET /repos/{owner}/{repo}/releases',
    {
      owner: 'datafabriclab',
      repo: 'nebulactl',
    }
  );
  switch (version) {
    case 'latest':
      for (const asset of releases[0].assets) {
        if (assetName === asset.name) {
          return asset.browser_download_url;
        }
      }
      break;
    default:
      for (const release of releases) {
        if (releaseTagIsVersion(release.tag_name, version)) {
          for (const asset of release.assets) {
            if (assetName === asset.name) {
              return asset.browser_download_url;
            }
          }
        }
      }
  }
  return {
    message: `Unable to find nebulactl version "${version}" for platform "${platform}" and architecture "${architecture}".`
  };
}

function releaseTagIsVersion(releaseTag: string, version: string): boolean {
  if (releaseTag.indexOf(versionPrefix) === 0) {
    releaseTag = releaseTag.slice(versionPrefix.length)
  }
  if (version.indexOf(versionPrefix) === 0) {
    version = version.slice(versionPrefix.length)
  }
  return releaseTag === version
}

