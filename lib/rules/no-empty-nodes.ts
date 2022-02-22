import type { XMLDocument, XMLElement, XMLTextContent } from "@xml-tools/ast";
import type { FixerCommands } from "../fixer";
import { createStartLineBreakPattern, createGlobalLineBreakPattern } from "../ast-utils";

const EmptyNodes = new Map<XMLElement | XMLDocument, boolean>();

function isValidTextContents(textContents: XMLTextContent[]) {
  const globalLineBreakPattern = createGlobalLineBreakPattern();
  return textContents.some(textContent => textContent.text?.replace(/\s/g, '').replace(globalLineBreakPattern, '').length);
}

function isNodeEmpty(node: XMLElement | XMLDocument): boolean {
  if (node.type === 'XMLDocument') {
    if (node.rootElement) {
      if (!isNodeEmpty(node.rootElement)) return false;
    }
  } else {
    if (node.attributes.length) return false;

    if (isValidTextContents(node.textContents)) return false;

    for (const element of node.subElements) {
      if (!isNodeEmpty(element)) return false;
    }
  }

  return true;
}

export default {
  create: (context: any) => {
    return {
      XMLDocument(document: XMLDocument) {
        if (isNodeEmpty(document)) {
          EmptyNodes.set(document, true);

          context.report({
            message: `Document contains only empty nodes.`,
            position: {
              startOffset: document.position.startOffset,
              startLine: document.position.startLine,
              startColumn: document.position.startColumn,
              endOffset: document.position.endOffset,
              endLine: document.position.endLine,
              endColumn: document.position.endColumn,
            },
          })
        }
      },
      XMLElement(node: XMLElement) {
        {
          // continue if a parent node is reported empty
          let parent = node;
          while (parent = parent.parent as XMLElement) {
            if (EmptyNodes.get(parent)) return;
          }
        }

        if (isNodeEmpty(node)) {
          EmptyNodes.set(node, true);

          context.report({
            message: `Nodes should not be empty.`,
            position: {
              startOffset: node.position.startOffset,
              startLine: node.position.startLine,
              startColumn: node.position.startColumn,
              endOffset: node.position.endOffset,
              endLine: node.position.endLine,
              endColumn: node.position.endColumn,
            },
            fix(fixer: typeof FixerCommands) {
              const startLineBreakPattern = createStartLineBreakPattern();
              const endOffset = node.position.endOffset + 1;
              const startOffset = node.position.startOffset - node.position.startColumn + 1;
              const lineBreakOffset = context.source
                .slice(endOffset)
                .match(startLineBreakPattern)
               ?.[0]
                .length ?? 0;

              return fixer.removeRange(
                [
                  startOffset,
                  endOffset + lineBreakOffset,
                ]
              );
            },
          });
        }
      }
    }
  },
}