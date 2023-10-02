import {CItem} from '@shared/types/circulize'
import {ExpressionObject, TokenObject, Tokens, Expression} from "../types/editor";
import {circulize} from "./circulize";

const equationTokens = [
  Tokens.Less, Tokens.More, Tokens.LessEq, Tokens.MoreEq, Tokens.Eq, Tokens.NotEq
]

const equationArgsTokens = [
  Tokens.String, Tokens.Number, Tokens.Keyword
]

const equationArgMap = new Map([
  [Tokens.Keyword, [Tokens.String, Tokens.Number]],
  [Tokens.String, [Tokens.Keyword]],
  [Tokens.Number, [Tokens.Keyword]]
])

function getEqExpression(cToken?: CItem<TokenObject>): ExpressionResult | undefined {
  if (cToken) {
    const cNext = cToken.n
    const cPrevious = cToken.p

    const token = cToken.i
    const nextToken = cNext?.i
    const previousToken = cPrevious?.i

    if (equationTokens.includes(token.type)) {
      if (previousToken) {
        if (!equationArgsTokens.includes(previousToken.type)) {
          return {
            expression: {
              type: Expression.Eq,
              closed: false,
              tokens: [previousToken, token],
              comment: `First token is invalid. Type: "${previousToken.type}"`,
            },
            next: cNext
          }
        }

        if (nextToken) {
          if (!equationArgsTokens.includes(nextToken.type)) {
            return {
              expression: {
                type: Expression.Eq,
                closed: false,
                tokens: [previousToken, token, nextToken],
                comment: `Second argument is invalid. Type: "${nextToken.type}"`,
              },
              next: cNext
            }
          }

          if (equationArgMap.get(previousToken.type)?.includes(nextToken.type)) {
            return {
              expression: {
                type: Expression.Eq,
                closed: true,
                tokens: [previousToken, token, nextToken],
              },
              next: cNext.n
            }
          }

          return {
            expression: {
              type: Expression.Eq,
              closed: false,
              tokens: [previousToken, token, nextToken],
              comment: `Arguments should be [Keyword, String | Number] or vice versa. 1st: "${previousToken.type}", 2nd: "${nextToken.type}"`,
            },
            next: cNext.n
          }
        }

        return {
          expression: {
            type: Expression.Eq,
            closed: false,
            tokens: [previousToken, token],
            comment: `Undexpected end of input`,
          },
          next: undefined
        }
      }

      return {
        expression: {
          type: Expression.Eq,
          closed: false,
          tokens: [token],
          comment: 'First argument is not defined',
        },
        next: cNext
      }
    }
  }

  return undefined
}


function getAndExpression(cToken?: CItem<TokenObject>, previousExpression?: ExpressionObject): ExpressionResult | undefined {
  if (cToken && cToken.i.type === Tokens.And) {
    const cNext = cToken?.n

    const eqExpression = getEqExpression(cNext) || getEqExpression(cNext?.n)

    const children: ExpressionObject[] = []

    if (previousExpression) {
      children.push(previousExpression)
    }

    if (eqExpression) {
      children.push(eqExpression.expression)
    }

    return {
      expression: {
        type: Expression.And,
        closed: true,
        children
      },
      next: eqExpression?.next || cNext
    }
  }
  return undefined
}


export function getOrExpression(cToken?: CItem<TokenObject>, previousExpression?: ExpressionObject): ExpressionResult | undefined {
  if (cToken && cToken.i.type === Tokens.Or) {
    const cNext = cToken?.n

    const expression = _getSyntaxTree(cNext)

    const children: ExpressionObject[] = []

    if (previousExpression) {
      children.push(previousExpression)
    }

    if (expression) {
      children.push(expression)
    }

    return {
      expression: {
        type: Expression.Or,
        closed: true,
        children
      },
      next: undefined
    }
  }

  return undefined
}


function _getSyntaxTree(cToken?: CItem<TokenObject>, previousExpression?: ExpressionObject): ExpressionObject | undefined {
  if (cToken) {
    const result =
      getAndExpression(cToken, previousExpression) ||
      getOrExpression(cToken, previousExpression) ||
      getEqExpression(cToken)

    return result
      ? _getSyntaxTree(result.next, result?.expression)
      : _getSyntaxTree(cToken.n, previousExpression)
  }

  return previousExpression
}

export function getSyntaxTree(tokens: TokenObject[]) {
  const cToken = circulize(tokens)
  const result = _getSyntaxTree(cToken)
  console.log(result)

  return result
}


interface ExpressionResult {
  expression: ExpressionObject
  next?: CItem<TokenObject>
}

