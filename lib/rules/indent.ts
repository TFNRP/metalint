import type { XMLDocument, XMLElement } from "@xml-tools/ast";
import type { ElementCstNode } from "@xml-tools/parser";
import type { FixerCommands } from "../fixer";

export default {
  schema: [
    {
      oneOf: [
        {
          enum: ["tab"]
        },
        {
          type: "integer",
          minimum: 0
        },
      ],
    },
    {
      type: "object",
      properties: {
        ignoreComments: {
          type: "boolean",
          default: false
        },
      },
      additionalProperties: false
    },
  ],
  create: (context: any) => {
    let indentType = "space";
    let indentSize = 4;

    const options = {
      ignoreComments: false,
    }

    if (context.options.length) {
      if (context.options[0] === "tab") {
        indentSize = 1;
        indentType = "tab";
      } else {
        indentSize = context.options[0];
        indentType = "space";
      }

      if (context.options[1]) {
        Object.assign(options, context.options[1]);
      }
    }

    const indent = indentType === 'tab' ? '\t' : ' ';
    const expectedIndent = indent.repeat(indentSize);

    return {
      XMLElement(node: XMLElement) {
        let offset = -1;

        {
          let parent = node;
          while (parent = parent.parent as XMLElement) offset++;
        }

        const actualIndent = context.getLine(node.position.startLine - 1).slice(0, node.position.startColumn - 1);
        const fullExpectedIndent = expectedIndent.repeat(offset);

        // check if the indent is only whitespace
        if (actualIndent.replace(/\s/g, '').length !== 0) return;

        if (actualIndent !== fullExpectedIndent) {
          const actualSpaces = actualIndent.replace(/[^ ]/g, '').length;
          const actualTabs = actualIndent.replace(/[^\t]/g, '').length;
          const expectedStatement = `${fullExpectedIndent.length} ${indentType}${offset === 1 ? "" : "s"}`;
          const foundSpacesWord = `space${actualSpaces === 1 ? "" : "s"}`;
          const foundTabsWord = `tab${actualTabs === 1 ? "" : "s"}`;
          let foundStatement;

          if (actualSpaces > 0) {
            foundStatement = indentType === "space" ? actualSpaces : `${actualSpaces} ${foundSpacesWord}`;
          } else if (actualTabs > 0) {
            foundStatement = indentType === "tab" ? actualTabs : `${actualTabs} ${foundTabsWord}`;
          } else {
            foundStatement = "0";
          }

          context.report({
            message: `Expected indentation of ${expectedStatement} but found ${foundStatement}.`,
            position: {
              startOffset: node.position.startOffset - node.position.startColumn,
              startLine: node.position.startLine,
              startColumn: 0,
              endOffset: node.position.endOffset,
              endLine: node.position.startLine,
              endColumn: node.position.startColumn,
            },
            fix(fixer: typeof FixerCommands) {
              return fixer.replaceTextRange(
                [
                  node.position.startOffset - node.position.startColumn,
                  node.position.startOffset,
                ],
                fullExpectedIndent
              );
            },
          })
        }
      }
    }

    // const result = [];

    // for (let i = 0; i < node.children.content.length; i++) {
    //   const content = node.children.content[i];

    //   if (content.children.chardata.length === 1) {
    //     const chardata = content.children.chardata[0];
    //     const token = chardata.children.SEA_WS[0];
    //     const lines = token.image.split('\n').slice(1);

    //     for (let i = 0; i < lines.length; i++) {
    //       const line = lines[i];
    //       if (line === config.indentBy) continue;
    //       const startLine = token.startLine as number + i;
    //       const endColumn = line.length - 1;

    //       result.push({
    //         loc: {
    //           start: { line: startLine, column: 0 },
    //           end: { line: startLine, column: endColumn },
    //         },
    //         fix(fixer: typeof FixerCommands) {
    //           const startIndex = token.startOffset + (!i ? i : lines.slice(0, i).reduce((a, b) => a + b) as unknown as number);

    //           return fixer.replaceTextRange([startIndex, startIndex + endColumn], config.indentBy)
    //         },
    //       })
    //     }
    //   }
    // }

    // return result;
  },
}