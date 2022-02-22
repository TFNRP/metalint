const BOM = "\uFEFF";

function compareMessagesByFixRange(a: any, b: any) {
  return a.fix.range[0] - b.fix.range[0] || a.fix.range[1] - b.fix.range[1];
}

function compareMessagesByLocation(a: any, b: any) {
  return a.line - b.line || a.column - b.column;
}

export class Fixer extends null {
  static applyFix(source: string, messages: any[], shouldFix: boolean) {
    if (!shouldFix) {
      return {
        fixed: false,
        messages,
        output: source,
      };
    }

    const remainingMessages = [];
    const fixes = [];
    const bom = source.startsWith(BOM) ? BOM : '';
    const text = bom ? source.slice(1) : source;
    let lastPos = Number.NEGATIVE_INFINITY;
    let output = '';

    for (const problem of messages) {
      if (Object.prototype.hasOwnProperty.call(problem, 'fix')) {
        fixes.push(problem);
      } else {
        remainingMessages.push(problem);
      }
    }

    if (fixes.length !== 0) {
      for (const problem of fixes.sort(compareMessagesByFixRange)) {
        const fix = problem.fix;
        const start = fix.range[0];
        const end = fix.range[1];

        if (lastPos > start || start > end) {
          remainingMessages.push(problem);
          continue;
        }

        if ((start < 0 && end >= 0) || (start === 0 && fix.text.startsWith(BOM))) {
          output = '';
        }

        output += text.slice(Math.max(0, lastPos), Math.max(0, start));
        output += fix.text;
        lastPos = end;
      }

      output += text.slice(Math.max(0, lastPos));

      return {
        fixed: true,
        messages: remainingMessages.sort(compareMessagesByLocation),
        output
      };
    }

    return {
      fixed: false,
      messages,
      output: bom + text,
    };
  }
}

export class FixerCommands extends null {
  static replaceTextRange(range: Range, text: string) {
    return {
      range,
      text,
    };
  }

  static removeRange(range: Range) {
    return {
      range,
      text: '',
    };
  }
}