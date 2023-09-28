import {CItem} from '@shared/types/circulize'
import {ExpressionObject, TokenObject, Tokens, Expression} from "../types/editor";
import {circulize} from "./circulize";

const equationTokens = [
  Tokens.Less, Tokens.More, Tokens.LessEq, Tokens.MoreEq, Tokens.Eq, Tokens.NotEq
]

const secondArgTokens = [
  Tokens.String, Tokens.Number
]

function getEquation(cToken: CItem<TokenObject>): ExpressionResult {
  const cSecond = cToken?.n
  const cThird = cToken?.n?.n
  const first = cToken?.i
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

  return {
    next: cToken
  }
}

export function getSyntaxTree(tokens: TokenObject[]) {
  const expressions: ExpressionObject[] = []
  let cToken = circulize(tokens)

  while (cToken) {
    const {next, expression} = getEquation(cToken)

    if (expression) {
      expressions.push(expression)
      cToken = next
    } else {
      cToken = next?.n
    }
  }

  return expressions
}


interface ExpressionResult {
  expression?: ExpressionObject
  next?: CItem<TokenObject>
}

