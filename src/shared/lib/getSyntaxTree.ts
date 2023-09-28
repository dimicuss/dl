import {CItem} from '@shared/types/circulize'
import {chainCommands} from 'prosemirror-commands';
import {ExpressionObject, TokenObject, Tokens, Expression} from "../types/editor";
import {circulize} from "./circulize";

const equationTokens = [
  Tokens.Less, Tokens.More, Tokens.LessEq, Tokens.MoreEq, Tokens.Eq, Tokens.NotEq
]

const secondArgTokens = [
  Tokens.String, Tokens.Number
]

function getEqExpression(cToken: CItem<TokenObject>): ExpressionResult | undefined {
  const cSecond = cToken.n
  const cThird = cToken.n?.n
  const first = cToken.i
  const second = cSecond?.i
  const third = cThird?.i

  if (first.type === Tokens.Keyword) {
    if (second) {
      if (equationTokens.includes(second.type)) {
        if (third) {
          if (secondArgTokens.includes(third.type)) {
            return {
              expression: {
                type: Expression.Eq,
                closed: true,
                tokens: [first, second, third],
              },
              next: cThird.n
            }
          }

          return {
            expression: {
              type: Expression.Eq,
              closed: false,
              tokens: [first, second, third],
              comment: `Second equation arg is not alphanum. Token is "${third.charRange.range}"`,
            },
            next: cThird.n
          }
        }

        return {
          expression: {
            type: Expression.Eq,
            closed: false,
            tokens: [first, second],
            comment: 'Second equation arg is undefined',
          },
          next: cThird
        }
      }

      return {
        expression: {
          type: Expression.Eq,
          closed: false,
          tokens: [first, second],
          comment: `Unexpected equation token. Token is "${second.charRange.range}"`,
        },
        next: cThird
      }
    }

    return {
      expression: {
        type: Expression.Eq,
        closed: false,
        tokens: [first],
        comment: 'Equation token not defined',
      },
      next: cSecond
    }
  }

  return undefined
}


function getAndExpression(cToken: CItem<TokenObject>, previousExpression?: ExpressionObject): ExpressionResult | undefined {
  const first = cToken.i
  const cSecond = cToken?.n

  if (first.type === Tokens.And) {
    if (previousExpression) {
      if (cSecond) {
        const result = getEqExpression(cSecond)

        if (result) {
          return {
            expression: {
              type: Expression.And,
              closed: true,
              children: [previousExpression, result.expression]
            },
            next: result.next
          }
        }

        return {
          expression: {
            type: Expression.And,
            closed: false,
            comment: 'Right handed arg is not eq expression',
            children: [previousExpression]
          },
          next: cSecond
        }
      }


      return {
        expression: {
          type: Expression.And,
          closed: false,
          comment: 'Undexpected end of input',
          children: [previousExpression]
        },
        next: cSecond
      }
    }

    return {
      expression: {
        type: Expression.And,
        closed: false,
        comment: 'Left handed arg not defined',
        children: []
      },
      next: cSecond
    }
  }

  return undefined
}

export function getSyntaxTree(tokens: TokenObject[]) {
  let cToken = circulize(tokens)
  let previousExpression: ExpressionObject | undefined

  while (cToken) {
    const result = getEqExpression(cToken) || getAndExpression(cToken, previousExpression)

    if (result) {
      previousExpression = result.expression
      cToken = result.next
    } else {
      cToken = cToken.n
    }
  }

  return previousExpression
}


interface ExpressionResult {
  expression: ExpressionObject
  next?: CItem<TokenObject>
}

