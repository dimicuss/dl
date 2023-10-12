import {ExpressionObject} from "@shared/types/editor";

const spaceFactor = 4

export function _serializeExpression(expression: ExpressionObject | undefined, n = 1): string {
  if (expression) {
    const children = expression.children || []
    const tokens = expression.tokens || []


    const renderedChildren =
      children.reduce((acc, child) => {
        return acc + '\n' + ' '.repeat(n * spaceFactor) + _serializeExpression(child, n + 1)
      }, '') ||
      tokens.reduce((acc, child) => {
        return acc + ' ' + child.charRange.range
      }, '') ||
      ''

    return '(' + expression.type + renderedChildren + ')'
  }

  return ''
}

export function serializeExpression(expressions: ExpressionObject[] = []) {
  return expressions.map((e) => _serializeExpression(e)).join('\n')
}
