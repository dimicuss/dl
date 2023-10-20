import {CItem} from '@shared/types/circulize'
import {ExpressionObject, TokenObject, Tokens, Expression, Atom} from "../types/editor";
import {circulize, copyCItem, findCItem} from "./circulize";
import {eq, lessEq, notEq, more, less, moreEq, and, or, stringRegEx, keywords, numberRegEx} from './tokens';

const equationTokens = new Map([
  [eq, Expression.Eq],
  [notEq, Expression.NotEq],
  [more, Expression.More],
  [less, Expression.Less],
  [lessEq, Expression.LessEq],
  [moreEq, Expression.MoreEq]
])

const equationArgsTokens = [
  Atom.String, Atom.Number, Atom.Keyword
]

const atomTokens = [
  Tokens.RBrace, Tokens.Atom
]

const equationArgMap = new Map([
  [Atom.Keyword, [Atom.String, Atom.Number]],
  [Atom.String, [Atom.Keyword]],
  [Atom.Number, [Atom.Keyword]]
])

function getExpression(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionObject[] | undefined {
  if (cToken) {
    const type = equationTokens.get(cToken.i.charRange.range)

    if (type) {
      const nextAtom = getAtom(cToken.n)
      const previousAtom = previousExpressions.at(-1)
      let handledPreviousExpressions = previousExpressions

      let next: CItem<TokenObject> | undefined
      const children: ExpressionObject[] = []
      const comment: string[] = []

      if (previousAtom?.atomType) {
        if (!equationArgsTokens.includes(previousAtom.atomType)) {
          comment.push(`First argument is invalid. Type: "${previousAtom.atomType}"`)
        }
        handledPreviousExpressions = previousExpressions.slice(0, -1)
        children.push(previousAtom)
      } else {
        comment.push('First argument is not defined')
      }

      if (nextAtom?.atomType) {
        if (!equationArgsTokens.includes(nextAtom.atomType)) {
          comment.push(`Second argument is invalid. Type: "${nextAtom.atomType}"`)
        }
        children.push(nextAtom)
        next = cToken?.n?.n
      } else {
        next = cToken.n
        comment.push('Second argument is not defined')
      }

      if (nextAtom?.atomType && previousAtom?.atomType && !equationArgMap.get(previousAtom.atomType)?.includes(nextAtom.atomType)) {
        comment.push('Arguments should be [Keyword, String | Number] or vice versa. 1st: "${previousToken.type}", 2nd: "${nextToken.type}"')
      }

      return _getSyntaxTree(next, [...handledPreviousExpressions, {
        type,
        comment,
        children,
        tokens: [cToken.i]
      }])
    }
  }

  return undefined
}

function getAnd(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionObject[] | undefined {
  if (cToken && cToken.i.charRange.range === and) {
    const tokens: TokenObject[] = []
    const children: ExpressionObject[] = []
    const previousExpression = previousExpressions.at(-1)
    const [nextExpression, ...nextRest] = _getSyntaxTree(cToken.n)

    tokens.push(cToken.i)

    if (previousExpression) {
      children.push(previousExpression)
    }

    if (nextExpression) {
      if (nextExpression.type === Expression.Or) {
        const orChildren: ExpressionObject[] = []
        const andTokens: TokenObject[] = []
        const andChildren: ExpressionObject[] = [...children]
        const nextChildren = nextExpression.children || []
        const [firstOrExpression, ...restOrExpressions] = nextChildren

        if (firstOrExpression) {
          if (firstOrExpression.type === Expression.And) {
            const firstOrExpressionChildren = firstOrExpression.children || []
            andChildren.push(...firstOrExpressionChildren)
            andTokens.push(...firstOrExpression.tokens)
          } else {
            andChildren.push(firstOrExpression)
          }
        }

        andTokens.push(cToken.i)

        orChildren.push(
          {
            type: Expression.And,
            children: andChildren,
            tokens: andTokens
          },
          ...restOrExpressions
        )

        return [
          ...previousExpressions.slice(0, -1),
          {
            type: Expression.Or,
            children: orChildren,
            tokens: nextExpression.tokens,
          },
          ...nextRest
        ]
      } else if (nextExpression.type === Expression.And) {
        const nextChildren = nextExpression.children || []
        children.push(...nextChildren)
        tokens.push(...nextExpression.tokens)
      } else {
        children.push(nextExpression)
      }
    }

    return [
      ...previousExpressions.slice(0, -1),
      {
        type: Expression.And,
        children,
        tokens,
      },
      ...nextRest
    ]
  }

  return undefined
}


export function getOr(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionObject[] | undefined {
  if (cToken && cToken.i.charRange.range === or) {
    const cNext = cToken?.n
    const tokens: TokenObject[] = []
    const children: ExpressionObject[] = []
    const previousExpression = previousExpressions.at(-1)
    const [nextExpression, ...nextRest] = _getSyntaxTree(cNext)

    tokens.push(cToken.i)

    if (previousExpression) {
      children.push(previousExpression)
    }

    if (nextExpression) {
      if (nextExpression.type === Expression.Or) {
        const nextChildren = nextExpression.children || []
        children.push(...nextChildren)
        tokens.push(...nextExpression.tokens)
      } else {
        children.push(nextExpression)
      }
    }

    return [
      ...previousExpressions.slice(0, -1), {
        type: Expression.Or,
        children,
        tokens
      },
      ...nextRest
    ]
  }

  return undefined
}


function getBraced(cToken?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionObject[] | undefined {
  if (cToken && cToken.i.type === Tokens.LBrace) {
    const comment: string[] = []
    const tokens: TokenObject[] = []

    let rBraceCount = 0
    let lBraceCount = 1
    const lastRBrace = findCItem(cToken.n, ({i}) => {
      if (i.type === Tokens.RBrace) rBraceCount++
      if (i.type === Tokens.LBrace) lBraceCount++
      return rBraceCount === lBraceCount
    })

    const copiedTree = lastRBrace ? copyCItem(cToken.n, (cItem) => cItem !== lastRBrace) : cToken.n
    const children = _getSyntaxTree(copiedTree)

    tokens.push(cToken.i)

    if (children.length < 1) {
      comment.push('Empty braces')
    }

    if (children.length > 1) {
      comment.push('Braces cannot have more expression than one')
    }

    if (lastRBrace) {
      tokens.push(lastRBrace.i)
    } else {
      comment.push('Unclosed brace')
    }

    const expression: ExpressionObject = {
      type: Expression.Braced,
      children,
      comment,
      tokens
    }

    return lastRBrace
      ? _getSyntaxTree(lastRBrace?.n, [...previousExpressions, expression])
      : [...previousExpressions, expression]
  }

  return undefined
}

function getAtom(cToken?: CItem<TokenObject>): ExpressionObject | undefined {
  if (cToken && atomTokens.includes(cToken.i.type)) {
    const {range} = cToken.i.charRange
    const atomType =
      keywords.includes(range) && Atom.Keyword ||
      stringRegEx.test(range) && Atom.String ||
      numberRegEx.test(range) && Atom.Number ||
      Atom.Invalid

    return {
      type: Expression.Atom,
      atomType,
      tokens: [cToken.i]
    }
  }

  return undefined
}

function _getSyntaxTree(cToken?: CItem<TokenObject>, previousExpression: ExpressionObject[] = []): ExpressionObject[] {
  if (cToken) {
    const atom = getAtom(cToken)
    const nextToken = atom ? cToken.n : cToken
    const previousExpressionWithAtom = atom ? [...previousExpression, atom] : previousExpression

    const result =
      getBraced(nextToken, previousExpressionWithAtom) ||
      getAnd(nextToken, previousExpressionWithAtom) ||
      getOr(nextToken, previousExpressionWithAtom) ||
      getExpression(nextToken, previousExpressionWithAtom)

    return result || _getSyntaxTree(nextToken, previousExpressionWithAtom)
  }

  return previousExpression
}


export function getSyntaxTree(tokens: TokenObject[]) {
  const cToken = circulize(tokens)
  const result = _getSyntaxTree(cToken)
  return result
}
