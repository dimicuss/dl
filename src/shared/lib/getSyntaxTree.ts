import {CItem} from '@shared/types/circulize'
import {ExpressionObject, TokenObject, Tokens, Expression, Atom, AutoCompleteItem, Error} from "../types/editor";
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

function getErrorRange(tokens: TokenObject[]) {
  return {
    start: tokens?.[0]?.charRange?.start,
    end: tokens?.at(-1)?.charRange?.end,
  }
}

function _getSyntaxTree(cItem?: CItem<TokenObject>, endCItem?: CItem<TokenObject>, previousExpressions: ExpressionObject[] = []): ExpressionObject[] {
  if (cItem && cItem !== endCItem) {
    const atom = getAtom(cItem, endCItem)

    if (atom) {
      return _getSyntaxTree(cItem.n, endCItem, [...previousExpressions, atom])
    }

    const type = equationTokens.get(cItem.i.charRange.range)

    if (type) {
      const nextAtom = getAtom(cItem.n, endCItem)
      const previousAtom = previousExpressions.at(-1)
      let handledPreviousExpressions = previousExpressions

      let next: CItem<TokenObject> | undefined
      let completions: AutoCompleteItem[] = []
      const children: ExpressionObject[] = []
      const tokens = [cItem.i]
      const errors: Error[] = []

      if (previousAtom?.atomType) {
        if (!nextAtom?.atomType) {
          completions.push({
            start: cItem.i.charRange.end,
            end: cItem?.n?.i?.charRange?.start,
            completions: expressionAutoComplete.get(previousAtom.atomType) || []
          })
        }

        if (!equationArgsTokens.includes(previousAtom.atomType)) {
          errors.push({
            ...getErrorRange(previousAtom.tokens),
            text: `First argument is invalid. Type: ${previousAtom.atomType}`
          })
        }
        handledPreviousExpressions = previousExpressions.slice(0, -1)
        children.push(previousAtom)
      } else {
        errors.push({
          start: cItem.i.charRange.start,
          end: cItem.i.charRange.end,
          text: 'First argument is not defined'
        })
      }

      if (nextAtom?.atomType) {
        if (!previousAtom?.atomType) {
          completions.push({
            start: cItem?.p?.i?.charRange?.end,
            end: cItem.i.charRange.start,
            completions: expressionAutoComplete.get(nextAtom.atomType) || []
          })
        }
        if (!equationArgsTokens.includes(nextAtom.atomType)) {
          errors.push({
            ...getErrorRange(nextAtom.tokens),
            text: `Second argument is invalid. Type: ${nextAtom.atomType}`
          })
        }
        children.push(nextAtom)
        next = cItem?.n?.n
      } else {
        next = cItem.n
        errors.push({
          start: cItem.i.charRange.end,
          end: cItem.i.charRange.end,
          text: 'First argument is not defined'
        })
      }

      if (!previousAtom && !nextAtom) {
        completions.push(
          {
            start: cItem?.p?.i?.charRange?.end,
            end: cItem?.i.charRange.start,
            completions: fullAutoComplete
          },
          {
            start: cItem?.i.charRange.end,
            end: cItem?.n?.i?.charRange?.start,
            completions: fullAutoComplete
          }
        )
      }

      if (nextAtom?.atomType && previousAtom?.atomType && !equationArgMap.get(previousAtom.atomType)?.includes(nextAtom.atomType)) {
        errors.push({
          start: getErrorRange(previousAtom.tokens).start,
          end: getErrorRange(nextAtom.tokens).end,
          text: `Arguments should be [Keyword, String | Number] or vice versa. 1st: "${previousAtom.atomType}", 2nd: "${nextAtom.atomType}"`
        })
      }

      return _getSyntaxTree(next, endCItem, [...handledPreviousExpressions, {
        type,
        errors,
        children,
        tokens,
        closed: completions.length > 0,
        completions
      }])
    }


    if (cItem.i.charRange.range === and) {
      const tokens: TokenObject[] = []
      const children: ExpressionObject[] = []
      const previousExpression = previousExpressions.at(-1)

      const [nextExpression, ...nextRest] = _getSyntaxTree(cItem.n, endCItem)

      tokens.push(cItem.i)

      if (previousExpression) {
        children.push(previousExpression)
      }
      if (nextExpression) {
        if (nextExpression.type === Expression.Or) {
          const andTokens: TokenObject[] = []
          const orChildren: ExpressionObject[] = []
          const andChildren: ExpressionObject[] = [...children]
          const nextChildren = nextExpression.children || []
          const [firstOrExpression, ...restOrExpressions] = nextChildren

          if (firstOrExpression) {
            andChildren.push(firstOrExpression)
          }

          andTokens.push(cItem.i)

          orChildren.push(
            {
              type: Expression.And,
              children: andChildren,
              tokens: andTokens,
              closed: andChildren.length > 1,
              completions: [],
              errors: []
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
              completions: [],
              errors: []
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
          completions: [],
          errors: []
        },
        ...nextRest
      ]
    }

    if (cItem.i.charRange.range === or) {
      const tokens: TokenObject[] = []
      const children: ExpressionObject[] = []
      const previousExpression = previousExpressions.at(-1)
      const [nextExpression, ...nextRest] = _getSyntaxTree(cItem.n, endCItem)

      tokens.push(cItem.i)

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
          completions: [],
          errors: []
        },
        ...nextRest
      ]
    }

    if (cItem.i.type === Tokens.LBrace) {
      const errors: Error[] = []
      const tokens: TokenObject[] = []

      let rBraceCount = 0
      let lBraceCount = 1
      const lastRBrace = findCItem(cItem.n, ({i}) => {
        if (i.type === Tokens.RBrace) rBraceCount++
        if (i.type === Tokens.LBrace) lBraceCount++
        return rBraceCount === lBraceCount
      })

      const children = _getSyntaxTree(cItem.n, lastRBrace)

      tokens.push(cItem.i)

      if (children.length < 1) {
        errors.push({
          start: cItem.i.charRange.start,
          end: lastRBrace?.i?.charRange?.end,
          text: 'Empty braces'
        })
      }

      if (children.length > 1) {
        errors.push({
          start: cItem.i.charRange.start,
          end: lastRBrace?.i?.charRange?.end,
          text: 'Braces cannot have more expression than one'
        })
      }

      if (lastRBrace) {
        tokens.push(lastRBrace.i)
      } else {
        errors.push({
          start: cItem.i.charRange.start,
          text: 'Unclosed brace'
        })
      }

      const expression: ExpressionObject = {
        type: Expression.Braced,
        children,
        errors,
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

function getAtom(cItem?: CItem<TokenObject>, endToken?: CItem<TokenObject>): ExpressionObject | undefined {
  if (cItem && cItem !== endToken && atomTokens.includes(cItem.i.type)) {
    const {range} = cItem.i.charRange
    const errors: Error[] = []
    const atomType =
      keywords.includes(range) && Atom.Keyword ||
      stringRegEx.test(range) && Atom.String ||
      numberRegEx.test(range) && Atom.Number ||
      Atom.Invalid

    if (atomType === Atom.Invalid) {
      errors.push({
        start: cItem.i.charRange.start,
        end: cItem.i.charRange.end,
        text: 'Invalid atom detected'
      })
    }

    return {
      type: Expression.Atom,
      atomType,
      tokens: [cItem.i],
      children: [],
      closed: true,
      completions: [],
      errors,
    }
  }
}

export function getSyntaxTree(tokens: TokenObject[]) {
  const cItem = circulize(tokens)
  return _getSyntaxTree(cItem)
}
