import { readFileSync } from 'node:fs';
import { accept, buildAst, XMLDocument } from "@xml-tools/ast";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { Fixer, FixerCommands } from "./fixer";
import ruleMap from "./rules";
import glob from "glob";
import { Config } from './config';
import { lineBreakPattern } from './ast-utils';

export function runRules(source: string, ast: XMLDocument, rules: any): any[] {
  const problems: any[] = [];
  const linedSource = source.split(lineBreakPattern);

  for (const ruleId in rules) {
    const rule = ruleMap.get(ruleId);
    const options = rules[ruleId];
    const [errorLevel, ...ruleOptions] = options;
    if (!errorLevel) continue;

    const visitors = rule.create({
      getLine(line: number) {
        return linedSource[line];
      },
      options: ruleOptions,
      source,
      report(problem: any) {
        if (typeof problem.fix === 'function') problem.fix = problem.fix(FixerCommands);
        problem.errorLevel = errorLevel;
        problems.push(problem);
      },
    });

    accept(ast, {
      visitXMLElement: visitors.XMLElement,
      visitXMLAttribute: visitors.XMLAttribute,
      visitXMLDocument: visitors.XMLDocument,
      visitXMLProlog: visitors.XMLProlog,
      visitXMLPrologAttribute: visitors.XMLPrologAttribute,
      visitXMLTextContent: visitors.XMLTextContent,
    });
  }

  return problems;
}

export function lintSource(source: string, { fix = false, rules = {} } = {}): any {
  const { cst, lexErrors, parseErrors, tokenVector } = parse(source);
  if (lexErrors.length !== 0 || parseErrors.length !== 0) {
    return [...parseErrors, ...lexErrors];
  }

  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const problems = runRules(source, ast, rules);

  return Fixer.applyFix(source, problems, fix);
}

export function lintFiles(patterns: string[], options: CliOptions): Record<string, any> {
  const result: Record<string, any> = {};
  const config = Config.getConfig();

  for (const pattern of patterns) {
    for (const file of glob.sync(pattern)) {
      if (result[file]) continue;

      const source = readFileSync(file, 'utf8');

      result[file] = lintSource(source, {
        fix: options.fix,
        rules: config.rules,
      });
    }
  }

  return result;
}