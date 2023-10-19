import {CharPosition, CharRange, Symbol, TokenObject, Tokens} from "../types/editor";
import {keywords, numberRegEx, stringRegEx, rBrace, lBrace, delimieters, expressionTokens} from "./tokens";

function isDelimiter(c: Symbol) {
  return delimieters.includes(c)
}

function getSubChars(chars: CharPosition[], left: number, right: number) {
  const subChars: CharPosition[] = []

  for (let i = left; i <= right; i++) {
    subChars.push(chars[i])
  }

  return subChars;
}

function getCharRange(chars: CharPosition[]): CharRange {
  const range = chars.reduce((result, {char}) => result + char, '')

  return {
    start: chars[0].pos,
    end: chars[chars.length - 1].pos,
    range,
  }
}

function getToken(charRange: CharRange, type: Tokens): TokenObject {
  return {
    type,
    charRange
  }
}

export function getTokens(chars: CharPosition[]) {
  let left = 0
  let right = 0
  let len = chars.length
  const result: TokenObject[] = []

  while (right < len && left <= right) {
    const currentCharP = chars[right]
    const char = currentCharP.char

    if (!isDelimiter(char)) {
      right++
    }

    if (isDelimiter(char) && left === right) {
      const charRange = getCharRange([currentCharP])

      if (char === rBrace) {
        result.push(getToken(charRange, Tokens.RBrace))
      }

      if (char === lBrace) {
        result.push(getToken(charRange, Tokens.LBrace))
      }

      right++
      left = right
    } else if (isDelimiter(char) && left !== right || right === len && left !== right) {
      const subChars = getSubChars(chars, left, right - 1);
      const charRange = getCharRange(subChars)
      const subStr = charRange.range

      if (expressionTokens.includes(subStr)) {
        result.push(getToken(charRange, Tokens.Expression))
      }

      else {
        result.push(getToken(charRange, Tokens.Atom))
      }

      left = right
    }
  }

  return result
}
