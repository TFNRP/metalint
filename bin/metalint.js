#!/usr/bin/env node

"use strict";

require("v8-compile-cache");

function getErrorMessage(error) {
  const util = require("util");

  if (typeof error !== "object" || error === null) {
    return String(error);
  }

  if (typeof error.stack === "string") {
    return error.stack;
  }

  return util.format("%o", error);
}

function onFatalError(error) {
  process.exitCode = 2;

  const { version } = require("../package.json");
  const message = getErrorMessage(error);

  console.error(`
Oops! Something went wrong! :(

MetaLint: ${version}

${message}`);
}

(async function main() {
  process.on("uncaughtException", onFatalError);
  process.on("unhandledRejection", onFatalError);

  process.exitCode = await require("../dist/cli").execute(process.argv);
}()).catch(onFatalError);
