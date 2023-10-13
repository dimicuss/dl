import {CItem} from '@shared/types/circulize'
import {ExpressionObject, TokenObject, Tokens, Expression} from "../types/editor";
import {circulize, copyCItem, findCItem} from "./circulize";
import {eq, lessEq, notEq, more, less, moreEq} from './tokens';

const equationTokens = new Map([
  [eq, Expression.Eq],
  [notEq, Expression.NotEq],
  [more, Expression.More],
  [less, Expression.Less],
  [lessEq, Expression.LessEq],
  [moreEq, Expression.MoreEq]
])

const equationArgsTokens = [
  Tokens.String, Tokens.Number, Tokens.Keyword
]

const invalidExpressionTokens = [
  Tokens.RBrace, Tokens.Invalid
]

const equationArgMap = new Map([
  [Tokens.Keyword, [Tokens.String, Tokens.Number]],
  [Tokens.String, [Tokens.Keyword]],
  [Tokens.Number, [Tokens.Keyword]]
])

function getExpression(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionObject[] | undefined {
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
        } else if (previousToken && !equationArgMap.get(previousToken.type)?.includes(nextToken.type)) {
          comment.push('Arguments should be [Keyword, String | Number] or vice versa. 1st: "${previousToken.type}", 2nd: "${nextToken.type}"')
          next = cNext
        } else {
          tokens.push(nextToken)
          next = cNext.n
        }
      } else {
        comment.push('Second argument is not defined')
        next = cNext
      }

      return _getSyntaxTree(next, [...previousExpressions, {
        type,
        tokens,
        comment,
      }])
    }

    return getExpression(cToken.n, previousExpressions)
  }

  return undefined
}

function getAnd(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionObject[] | undefined {
  if (cToken && cToken.i.type === Tokens.And) {
    const cNext = cToken.n
    const children: ExpressionObject[] = []
    const previousExpression = previousExpressions.at(-1)
    const [nextExpression, ...nextRest] = _getSyntaxTree(cNext, [])

    const expression = {
      type: Expression.And,
      children,
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
          children: [expression, ...restExpressions],
        }

        return [...previousExpressions.slice(0, -1), newOrExpression, ...nextRest]
      } else if (nextExpression.type === Expression.And) {
        const nextChildren = nextExpression.children || []
        children.push(...nextChildren)
      } else {
        children.push(nextExpression)
      }
    }

    return [...previousExpressions.slice(0, -1), expression, ...nextRest]
  }

  return undefined
}


export function getOr(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionObject[] | undefined {
  if (cToken && cToken.i.type === Tokens.Or) {
    const cNext = cToken?.n
    const children: ExpressionObject[] = []
    const previousExpression = previousExpressions.at(-1)
    const [nextExpression, ...nextRest] = _getSyntaxTree(cNext, [])

    const expression = {
      type: Expression.Or,
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

    return [...previousExpressions.slice(0, -1), expression, ...nextRest]
  }

  return undefined
}


function getBraced(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionObject[] | undefined {
  if (cToken && cToken.i.type === Tokens.LBrace) {
    let rBraceCount = 0
    let lBraceCount = 1
    const comment: string[] = []

    const lastRBrace = findCItem(cToken.n, ({i}) => {
      if (i.type === Tokens.RBrace) rBraceCount++
      if (i.type === Tokens.LBrace) lBraceCount++
      return rBraceCount === lBraceCount
    })

    const copiedTree = lastRBrace ? copyCItem(cToken.n, (cItem) => cItem !== lastRBrace) : cToken.n
    const children = _getSyntaxTree(copiedTree, [])

    if (children.length > 1) {
      comment.push('Braces cannot have more expression than one')
    }

    if (lastRBrace === undefined) {
      comment.push('Unclosed brace')
    }

    const expression: ExpressionObject = {
      type: Expression.Braced,
      children,
      comment
    }

    return lastRBrace
      ? _getSyntaxTree(lastRBrace?.n, [...previousExpressions, expression])
      : [...previousExpressions, expression]
  }

  return undefined
}

function getInvalid(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionObject[] | undefined {
  if (cToken && invalidExpressionTokens.includes(cToken.i.type)) {
    let comment: string[] = []

    if (cToken.i.type === Tokens.LBrace) {
      comment.push('Unexpected right brace')
    }

    if (cToken.i.type === Tokens.Invalid) {
      comment.push('Invalid token detected')
    }

    const expression: ExpressionObject = {
      type: Expression.Invalid,
      comment
    }

    return _getSyntaxTree(cToken.n, [...previousExpressions, expression])
  }

  return undefined
}

function _getSyntaxTree(cToken?: CItem<TokenObject>, previousExpression: ExpressionObject[] = []): ExpressionObject[] {
  if (cToken) {
    const result =
      getInvalid(cToken, previousExpression) ||
      getBraced(cToken, previousExpression) ||
      getAnd(cToken, previousExpression) ||
      getOr(cToken, previousExpression) ||
      getExpression(cToken, previousExpression)

    return result || previousExpression
  }

  return previousExpression
}


export function getSyntaxTree(tokens: TokenObject[]) {
  const cToken = circulize(tokens)
  const result = _getSyntaxTree(cToken)
  return result
}

