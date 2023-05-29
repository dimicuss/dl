import {SegmentObject, Segments, TokenObject, Tokens} from "../types/editor";

function equalsTo(...tokens: Tokens[]) {
  return function check(tokenObject: TokenObject) {
    return tokens.some((type) => type === tokenObject.type)
  }
}

function checkSegment(checkers: ((tokenObject: TokenObject) => boolean)[], type: Segments) {
  return function checkSequence(tokens: TokenObject[]): SegmentObject {
    const checkedTokens: TokenObject[] = [];
    let checkersLeft = Array.from(checkers)
    let tokensLeft = Array.from(tokens)

    while (checkersLeft.length > 0) {
      const token = tokensLeft[0]
      const checker = checkersLeft[0]

      if (token.type === Tokens.WhiteSpace || token.type === Tokens.LineBreak) {
        checkedTokens.push(token)
        tokensLeft.shift()
        continue
      }

      if (token === undefined) {
        return {
          type,
          tokens: checkedTokens,
          left: tokensLeft,
          error: new Error('Unexpected end of sequence')
        }
      }

      if (checker(token)) {
        checkedTokens.push(token)
        tokensLeft.shift()
        checkersLeft.shift()
      } else {
        return {
          type,
          tokens: checkedTokens,
          left: tokensLeft,
          error: new Error('Unexpected token in sequence')
        }
      }
    }

    return {
      type,
      tokens: checkedTokens,
      left: tokensLeft
    }
  }
}


const checkExpression = checkSegment([
  equalsTo(Tokens.Keyword),
  equalsTo(Tokens.Eq, Tokens.LessEq, Tokens.MoreEq, Tokens.NotEq, Tokens.More, Tokens.Less),
  equalsTo(Tokens.Identifier)
], Segments.Expression)


const checkLogOperator = checkSegment([
  equalsTo(Tokens.And, Tokens.Or),
], Segments.LogOperator)

export function analyzeTokens(tokens: TokenObject[]) {
  console.log(checkExpression(tokens))
}
