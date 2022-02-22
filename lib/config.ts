import { cosmiconfigSync } from 'cosmiconfig';

enum ErrorLevel {
  'off',
  'warn',
  'error',
}

export class Config {
  rules: Record<string, [ErrorLevel, ...any]>;
  constructor(config: any) {
    this.rules = config?.rules || {};
    for (const rule in this.rules) {
      const [errorLevel] = rule;
      if (typeof errorLevel === 'string') {
        switch (errorLevel) {
          case 'off':
          case 'warn':
          case 'error':
            this.rules[rule][0] = ErrorLevel[errorLevel]
        }
      }
    }
  }

  static getConfig(): Config {
    return new this(cosmiconfigSync('metalint').search()?.config);
  }
}