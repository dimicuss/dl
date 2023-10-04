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


function getEqExpression(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionResult | undefined {
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
            expression: [...previousExpressions, {
              type: Expression.Eq,
              closed: false,
              children: [],
              tokens: [previousToken],
              comment: `First token is invalid. Type: "${previousToken.type}"`,
            }],
            next: cNext
          }
        }

        if (nextToken) {
          if (!equationArgsTokens.includes(nextToken.type)) {
            return {
              expression: [...previousExpressions, {
                type: Expression.Eq,
                closed: false,
                tokens: [previousToken, nextToken],
                children: [],
                comment: `Second argument is invalid. Type: "${nextToken.type}"`,
              }],
              next: cNext
            }
          }

          if (equationArgMap.get(previousToken.type)?.includes(nextToken.type)) {
            return {
              expression: [...previousExpressions, {
                type: Expression.Eq,
                closed: true,
                children: [],
                tokens: [previousToken, nextToken],
              }],
              next: cNext.n
            }
          }

          return {
            expression: [...previousExpressions, {
              type: Expression.Eq,
              closed: false,
              tokens: [previousToken, nextToken],
              children: [],
              comment: `Arguments should be [Keyword, String | Number] or vice versa. 1st: "${previousToken.type}", 2nd: "${nextToken.type}"`,
            }],
            next: cNext.n
          }
        }

        return {
          expression: [...previousExpressions, {
            type: Expression.Eq,
            closed: false,
            tokens: [previousToken],
            children: [],
            comment: `Undexpected end of input`,
          }],
          next: undefined
        }
      }

      return {
        expression: [...previousExpressions, {
          type: Expression.Eq,
          closed: false,
          tokens: [token],
          children: [],
          comment: 'First argument is not defined',
        }],
        next: cNext
      }
    }
  }

  return undefined
}


function getAndExpression(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionResult | undefined {
  if (cToken && cToken.i.type === Tokens.And) {
    const cNext = cToken.n

    const expression: ExpressionObject = {
      type: Expression.And,
      closed: true,
      children: []
    }

    const nextExpression = getEqExpression(cNext) || getEqExpression(cNext?.n)
    const previousExpression = previousExpressions.at(-1)

    if (previousExpression) {
      if (previousExpression.type === Expression.And) {
        expression.children = [...expression.children, ...previousExpression.children]
      } else {
        expression.children?.push(previousExpression)
      }
    }

    if (nextExpression) {
      expression.children = [...expression.children, ...nextExpression.expression]
    }

    return {
      expression: [...previousExpressions.slice(0, -1), expression],
      next: nextExpression ? nextExpression.next : cNext
    }
  }

  return undefined
}


export function getOrExpression(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionResult | undefined {
  if (cToken && cToken.i.type === Tokens.Or) {
    const cNext = cToken?.n

    const expression: ExpressionObject = {
      type: Expression.Or,
      closed: true,
      children: []
    }

    const [nextExpression, ...nextRest] = _getSyntaxTree(cNext)

    const previousExpression = previousExpressions.at(-1)

    if (previousExpression) {
      expression.children.push(previousExpression)
    }

    if (nextExpression) {
      if (nextExpression.type === Expression.Or) {
        expression.children = [...expression.children, ...nextExpression.children]
      } else {
        expression.children.push(nextExpression)
      }
    }

    return {
      expression: [...previousExpressions.slice(0, -1), expression, ...nextRest],
      next: undefined
    }
  }

  return undefined
}


function _getSyntaxTree(cToken?: CItem<TokenObject>, previousExpression: ExpressionObject[] = []): ExpressionObject[] {
  if (cToken) {
    const result =
      getAndExpression(cToken, previousExpression) ||
      getOrExpression(cToken, previousExpression) ||
      getEqExpression(cToken, previousExpression)

    return result
      ? _getSyntaxTree(result.next, result?.expression)
      : _getSyntaxTree(cToken.n, previousExpression)
  }

  return previousExpression
}

export function getSyntaxTree(tokens: TokenObject[]) {
  const cToken = circulize(tokens)
  const result = _getSyntaxTree(cToken)
  return result
}


interface ExpressionResult {
  expression: ExpressionObject[]
  next?: CItem<TokenObject>
}

