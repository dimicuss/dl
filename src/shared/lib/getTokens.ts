import {CharPosition, CharRange, TokenObject, Tokens} from "../types/editor";
import {rBrace, lBrace, delimieters, expressionTokens} from "./tokens";

function getSubChars(chars: CharPosition[], left: number, right: number) {
  const subChars: CharPosition[] = []

  for (let i = left; i < right; i++) {
    subChars.push(chars[i] as CharPosition)
  }

  return subChars;
}

function getCharRange(chars: CharPosition[]): CharRange {
  const range = chars.reduce((result, {char}) => result + char, '')

  return {
    start: chars?.[0]?.pos as number,
    end: chars?.[chars.length - 1]?.pos as number,
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

  while (right <= len) {
    const nextChar = chars[right]?.char

    if (nextChar === undefined || delimieters.includes(nextChar)) {
      const subChars = getSubChars(chars, left, right);

      if (subChars.length) {
        const charRange = getCharRange(subChars)
        const subStr = charRange.range

        if (subStr === rBrace) {
          result.push(getToken(charRange, Tokens.RBrace))
        }

        else if (subStr === lBrace) {
          result.push(getToken(charRange, Tokens.LBrace))
        }

        else if (expressionTokens.includes(subStr)) {
          result.push(getToken(charRange, Tokens.Expression))
        }

        else {
          result.push(getToken(charRange, Tokens.Atom))
        }
      }

      right++
      left = right
    } else {
      right++
    }
  }

  return result
}
