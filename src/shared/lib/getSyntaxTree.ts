import {CItem} from '@shared/types/circulize'
import {ExpressionObject, TokenObject, Tokens, Expression} from "../types/editor";
import {circulize} from "./circulize";
import {eq, lessEq, notEq, more, less, moreEq} from './tokens';

const equationTokens = new Map([
  [eq, Expression.Eq],
  [notEq, Expression.NotEq],
  [more, Expression.More],
  [less, Expression.Less],
  [lessEq, Expression.Less],
  [moreEq, Expression.MoreEq]
])

const equationArgsTokens = [
  Tokens.String, Tokens.Number, Tokens.Keyword
]

const equationArgMap = new Map([
  [Tokens.Keyword, [Tokens.String, Tokens.Number]],
  [Tokens.String, [Tokens.Keyword]],
  [Tokens.Number, [Tokens.Keyword]]
])


function getExpression(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionResult | undefined {
  if (cToken) {
    const cNext = cToken.n
    const cPrevious = cToken.p

    const token = cToken.i
    const nextToken = cNext?.i
    const previousToken = cPrevious?.i

    const type = equationTokens.get(token.charRange.range)

    if (type) {
      let next: CItem<TokenObject> | undefined
      const tokens: TokenObject[] = []
      const comment: string[] = []

      if (previousToken) {
        if (!equationArgsTokens.includes(previousToken.type)) {
          comment.push(`First argument is invalid. Type: "${previousToken.type}"`)
        } else {
          tokens.push(previousToken)
        }
      } else {
        comment.push('First argument is not defined')
      }

      if (nextToken) {
        if (!equationArgsTokens.includes(nextToken.type)) {
          comment.push(`Second argument is invalid. Type: "${nextToken.type}"`)
          next = cNext
        } else {
          tokens.push(nextToken)
          next = cNext.n
        }
      } else {
        comment.push('Second argument is not defined')
        next = cNext
      }

      if (previousToken && nextToken && equationArgMap.get(previousToken.type)?.includes(nextToken.type)) {
        comment.push('Arguments should be [Keyword, String | Number] or vice versa. 1st: "${previousToken.type}", 2nd: "${nextToken.type}"')
      }

      return {
        expression: [...previousExpressions, {
          type,
          tokens,
          comment,
          closed: tokens.length > 1
        }],
        next,
      }
    }

    return getExpression(cToken.n, previousExpressions)
  }

  return undefined
}


function getAnd(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionResult | undefined {
  if (cToken && cToken.i.type === Tokens.And) {
    const cNext = cToken.n
    const children: ExpressionObject[] = []
    const previousExpression = previousExpressions.at(-1)
    const [nextExpression, ...nextRest] = _getSyntaxTree(cNext)

    const expression = {
      type: Expression.And,
      children,
      closed: true,
    }

    if (previousExpression) {
      children.push(previousExpression)
    }

    if (nextExpression) {
      if (nextExpression.type === Expression.Or) {
        const nextChildren = nextExpression.children || []
        const [firstOrExpression, ...restExpressions] = nextChildren

        if (firstOrExpression) {
          if (firstOrExpression.type === Expression.And) {
            const firstOrExpressionChildren = firstOrExpression.children || []
            children.push(...firstOrExpressionChildren)
          } else {
            children.push(firstOrExpression)
          }
        }

        const newOrExpression: ExpressionObject = {
          type: Expression.Or,
          closed: true,
          children: [expression, ...restExpressions],
        }

        return {
          expression: [...previousExpressions.slice(0, -1), newOrExpression, ...nextRest],
          next: undefined
        }
      } else if (nextExpression.type === Expression.And) {
        const nextChildren = nextExpression.children || []
        children.push(...nextChildren)
      } else {
        children.push(nextExpression)
      }
    }

    return {
      expression: [...previousExpressions.slice(0, -1), expression, ...nextRest],
      next: undefined
    }
  }

  return undefined
}


export function getOr(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionResult | undefined {
  if (cToken && cToken.i.type === Tokens.Or) {
    const cNext = cToken?.n
    const children: ExpressionObject[] = []
    const previousExpression = previousExpressions.at(-1)
    const [nextExpression, ...nextRest] = _getSyntaxTree(cNext)

    const expression = {
      type: Expression.Or,
      closed: true,
      children
    }

    if (previousExpression) {
      children.push(previousExpression)
    }

    if (nextExpression) {
      if (nextExpression.type === Expression.Or) {
        const nextChildren = nextExpression.children || []
        children.push(...nextChildren)
      } else {
        children.push(nextExpression)
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
      getAnd(cToken, previousExpression) ||
      getOr(cToken, previousExpression) ||
      getExpression(cToken, previousExpression)

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

