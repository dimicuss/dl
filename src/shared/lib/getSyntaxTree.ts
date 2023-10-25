import {CItem} from '@shared/types/circulize'
import {ExpressionObject, TokenObject, Tokens, Expression, Atom, AutoCompleteItem} from "../types/editor";
import {circulize, findCItem} from "./circulize";
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

const keywordAutoComplete = ['abc', '123']

const fullAutoComplete = [...keywords, ...keywordAutoComplete]

const expressionAutoComplete = new Map([
  [Atom.Number, keywords],
  [Atom.String, keywords],
  [Atom.Keyword, keywordAutoComplete]
])

function _getSyntaxTree(cToken?: CItem<TokenObject>, endCItem?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionObject[] {
  if (cToken && cToken !== endCItem) {
    const atom = getAtom(cToken, endCItem)

    if (atom) {
      return _getSyntaxTree(cToken.n, endCItem, [...previousExpressions, atom])
    }

    const type = equationTokens.get(cToken.i.charRange.range)

    if (type) {
      const nextAtom = getAtom(cToken.n, endCItem)
      const previousAtom = previousExpressions.at(-1)
      let handledPreviousExpressions = previousExpressions

      let next: CItem<TokenObject> | undefined
      let completions: AutoCompleteItem[] = []
      const children: ExpressionObject[] = []
      const comment: string[] = []
      const tokens = [cToken.i]


      if (previousAtom?.atomType) {
        if (!nextAtom?.atomType) {
          completions.push({
            start: cToken.i.charRange.end,
            end: cToken?.n?.i?.charRange?.start,
            completions: expressionAutoComplete.get(previousAtom.atomType) || []
          })
        }

        if (!equationArgsTokens.includes(previousAtom.atomType)) {
          comment.push(`First argument is invalid. Type: "${previousAtom.atomType}"`)
        }
        handledPreviousExpressions = previousExpressions.slice(0, -1)
        children.push(previousAtom)
      } else {
        comment.push('First argument is not defined')
      }

      if (nextAtom?.atomType) {
        if (!previousAtom?.atomType) {
          completions.push({
            start: cToken?.p?.i?.charRange?.end,
            end: cToken.i.charRange.start,
            completions: expressionAutoComplete.get(nextAtom.atomType) || []
          })
        }
        if (!equationArgsTokens.includes(nextAtom.atomType)) {
          comment.push(`Second argument is invalid. Type: "${nextAtom.atomType}"`)
        }
        children.push(nextAtom)
        next = cToken?.n?.n
      } else {
        next = cToken.n
        comment.push('Second argument is not defined')
      }

      if (!previousAtom && !nextAtom) {
        completions.push(
          {
            start: cToken?.p?.i?.charRange?.end,
            end: cToken?.i.charRange.start,
            completions: fullAutoComplete
          },
          {
            start: cToken?.i.charRange.end,
            end: cToken?.n?.i?.charRange?.start,
            completions: fullAutoComplete
          }
        )
      }

      if (nextAtom?.atomType && previousAtom?.atomType && !equationArgMap.get(previousAtom.atomType)?.includes(nextAtom.atomType)) {
        comment.push('Arguments should be [Keyword, String | Number] or vice versa. 1st: "${previousToken.type}", 2nd: "${nextToken.type}"')
      }

      return _getSyntaxTree(next, endCItem, [...handledPreviousExpressions, {
        type,
        comment,
        children,
        tokens,
        closed: completions.length > 0,
        completions
      }])
    }


    if (cToken.i.charRange.range === and) {
      const tokens: TokenObject[] = []
      const children: ExpressionObject[] = []
      const previousExpression = previousExpressions.at(-1)

      const [nextExpression, ...nextRest] = _getSyntaxTree(cToken.n, endCItem)

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
            andChildren.push(firstOrExpression)
          }

          andTokens.push(cToken.i)

          orChildren.push(
            {
              type: Expression.And,
              children: andChildren,
              tokens: andTokens,
              closed: andChildren.length > 1,
              completions: []
            },
            ...restOrExpressions
          )

          return [
            ...previousExpressions.slice(0, -1),
            {
              type: Expression.Or,
              children: orChildren,
              tokens: nextExpression.tokens,
              closed: orChildren.length > 1,
              completions: []
            },
            ...nextRest
          ]
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
          closed: children.length > 1,
          completions: []
        },
        ...nextRest
      ]
    }

    if (cToken.i.charRange.range === or) {
      const tokens: TokenObject[] = []
      const children: ExpressionObject[] = []
      const previousExpression = previousExpressions.at(-1)
      const [nextExpression, ...nextRest] = _getSyntaxTree(cToken.n, endCItem)

      tokens.push(cToken.i)

      if (previousExpression) {
        children.push(previousExpression)
      }

      if (nextExpression) {
        children.push(nextExpression)
      }

      return [
        ...previousExpressions.slice(0, -1), {
          type: Expression.Or,
          children,
          tokens,
          closed: children.length > 1,
          completions: []
        },
        ...nextRest
      ]
    }

    if (cToken.i.type === Tokens.LBrace) {
      const comment: string[] = []
      const tokens: TokenObject[] = []

      let rBraceCount = 0
      let lBraceCount = 1
      const lastRBrace = findCItem(cToken.n, ({i}) => {
        if (i.type === Tokens.RBrace) rBraceCount++
        if (i.type === Tokens.LBrace) lBraceCount++
        return rBraceCount === lBraceCount
      })

      const children = _getSyntaxTree(cToken.n, lastRBrace)

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
        tokens,
        closed: children.length > 0,
        completions: []
      }

      return lastRBrace
        ? _getSyntaxTree(lastRBrace.n, endCItem, [...previousExpressions, expression])
        : [...previousExpressions, expression]
    }

    return previousExpressions
  }

  return previousExpressions
}

function getAtom(cToken?: CItem<TokenObject>, endToken?: CItem<TokenObject>): ExpressionObject | undefined {
  if (cToken && cToken !== endToken && atomTokens.includes(cToken.i.type)) {
    const {range} = cToken.i.charRange
    const atomType =
      keywords.includes(range) && Atom.Keyword ||
      stringRegEx.test(range) && Atom.String ||
      numberRegEx.test(range) && Atom.Number ||
      Atom.Invalid

    return {
      type: Expression.Atom,
      atomType,
      tokens: [cToken.i],
      children: [],
      closed: true,
      completions: []
    }
  }
}

export function getSyntaxTree(tokens: TokenObject[]) {
  const cItem = circulize(tokens)
  return _getSyntaxTree(cItem)
}
