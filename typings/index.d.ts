declare interface CliOptions {
  /** Show help */
  help?: boolean;
  /** Output the version number */
  version?: boolean;
  /** Output execution environment information */
  envInfo?: boolean;
  /** Automatically fix problems */
  fix: boolean;
  /** Positional filenames or patterns */
  _: string[];
}

declare interface LintMessage {
  message: string;
  position: {
    startOffset: number;
    startLine: number;
    startColumn: number;
    endOffset: number;
    endLine: number;
    endColumn: number;
  };
  fix: (fixer: any) => {
    range: Range;
    text: string;
  };
}

declare type Range = [number, number]
