/**
 * @import { Rule } from "eslint"
 * @import { ImportDeclaration, Program } from "estree"
 */

/** @typedef {Program["body"][number]} Statement */

/**
 * @param {Statement} node
 * @returns {node is ImportDeclaration}
 */
function isReactNamespaceImport(node) {
  return (
    node.type === "ImportDeclaration" &&
    node.source.value === "react" &&
    node.specifiers.some((specifier) => specifier.type === "ImportNamespaceSpecifier")
  );
}

/**
 * Directives ("use client", "use strict", ...) are only directives while they
 * lead the file, so they are the one thing allowed above the React import.
 *
 * @param {Statement} node
 */
function isDirective(node) {
  return node.type === "ExpressionStatement" && "directive" in node;
}

/**
 * Widens a node's range to swallow the whole line when the node is the only
 * thing on it, so moving the import does not leave a blank line behind.
 *
 * @param {string} text
 * @param {[number, number]} range
 * @returns {[number, number]}
 */
function expandToFullLine(text, [start, end]) {
  let lineStart = start;
  while (lineStart > 0 && (text[lineStart - 1] === " " || text[lineStart - 1] === "\t")) {
    lineStart -= 1;
  }

  let lineEnd = end;
  while (text[lineEnd] === " " || text[lineEnd] === "\t") {
    lineEnd += 1;
  }

  const startsLine = lineStart === 0 || text[lineStart - 1] === "\n";
  let newline = 0;
  if (text.startsWith("\r\n", lineEnd)) {
    newline = 2;
  } else if (text[lineEnd] === "\n") {
    newline = 1;
  }

  if (!startsLine) {
    return [start, end];
  }
  if (newline > 0) {
    return [lineStart, lineEnd + newline];
  }
  if (lineEnd === text.length && lineStart > 0) {
    // Last line of a file with no trailing newline: take the newline before it.
    const precedingNewline = text.endsWith("\r\n", lineStart) ? 2 : 1;
    return [lineStart - precedingNewline, lineEnd];
  }
  return [start, end];
}

/** @type {Rule.RuleModule} */
const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: 'Require `import * as React from "react"` to be the first statement of the file',
    },
    fixable: "code",
    schema: [],
    messages: {
      notFirst:
        '`import * as React from "react"` must be the first statement in the file (only directives such as "use client" may precede it).',
    },
  },

  create(context) {
    const { sourceCode } = context;

    return {
      Program(program) {
        const first = program.body.find((node) => !isDirective(node));
        const reactImport = program.body.find(isReactNamespaceImport);

        if (!first || !reactImport || first === reactImport) {
          return;
        }

        const firstRange = first.range;
        const importRange = reactImport.range;
        if (!firstRange || !importRange) {
          return;
        }

        context.report({
          node: reactImport,
          messageId: "notFirst",
          fix: (fixer) => [
            fixer.insertTextBeforeRange(firstRange, `${sourceCode.getText(reactImport)}\n`),
            fixer.removeRange(expandToFullLine(sourceCode.text, importRange)),
          ],
        });
      },
    };
  },
};

export default rule;
