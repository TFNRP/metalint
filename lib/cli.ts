import process from 'node:process';
import CliOptions from './options';
import { version } from '../package.json';
import { platform, release } from 'node:os';
import { sync } from 'cross-spawn';
import { relative } from 'node:path';
import { lintFiles } from './linter';
import { writeFileSync } from 'node:fs';

function getBinVersion(bin: string) {
  const binArgs = ["--version"];

  try {
    return execCommand(bin, binArgs);
  } catch (e) {
    console.error(`Error finding ${bin} version running the command \`${bin} ${binArgs.join(" ")}\``);
    throw e;
  }
}

function execCommand(cmd: string, args: string[]) {
  const process = sync(cmd, args, { encoding: "utf8" });

  if (process.error) {
    throw process.error;
  }

  const result = process.stdout.trim();

  return result;
}

function getNpmPackageVersion(pkg: string, { global = false } = {}) {
  const npmBinArgs = ["bin", "-g"];
  const npmLsArgs = ["ls", "--depth=0", "--json", "eslint"];

  if (global) npmLsArgs.push("-g");

  try {
    const parsedStdout = JSON.parse(execCommand("npm", npmLsArgs));

    if (Object.keys(parsedStdout).length === 0 || !(parsedStdout.dependencies && parsedStdout.dependencies.eslint)) {
      return "Not found";
    }

    const [, processBinPath] = process.argv;
    let npmBinPath;

    try {
      npmBinPath = execCommand("npm", npmBinArgs);
    } catch (e) {
      console.error(`Error finding npm binary path when running command \`npm ${npmBinArgs.join(" ")}\``);
      throw e;
    }

    const isGlobal = !relative(npmBinPath, processBinPath).startsWith("..");
    let pkgVersion = parsedStdout.dependencies.metalint.version;

    if ((global && isGlobal) || (!global && !isGlobal)) {
      pkgVersion += " (Currently used)";
    }

    return pkgVersion;
  } catch (e) {
    console.error(`Error finding ${pkg} version running the command \`npm ${npmLsArgs.join(" ")}\``);
    throw e;
  }
}

export function execute(args: string | any[] | object): number {
  let options: CliOptions;
  try {
    options = CliOptions.parse(args);
  } catch (e) {
    console.error((e as Error).message);
    return 2;
  }

  const files = options._;

  if (options.help) {
    console.info(CliOptions.generateHelp());
    return 0;
  }
  if (options.version) {
    console.info(`v${version}`);
    return 0;
  }
  if (options.envInfo) {
    console.info(
      `Environment Info:\n
Node version: ${getBinVersion('node')}
NPM version: ${getBinVersion('npm')}
Local MetaLint version: ${getNpmPackageVersion('metalint', { global: false })}
Global MetaLint version: ${getNpmPackageVersion('metalint', { global: true })}
Operating System: ${platform()} ${release()}`
    );
    return 0;
  }

  const result = lintFiles(files, options);
  for (const filepath in result.messages) {
    const r = result[filepath];
    if (Array.isArray(r)) {
      console.error(`${filepath}\n${r}`)
      return 2;
    }
  }
  for (const filepath in result) {
    const r = result[filepath];
    for (const message of r.messages) {
      console.info(`${filepath} ${message.position.startLine}:${message.position.startColumn}\n${message.message}\n`);
    }
    if (options.fix && r.fixed) {
      writeFileSync(`./${filepath}`, r.output, 'utf8');
    }
    return r.errorLevel;
  }

  return 0;
}