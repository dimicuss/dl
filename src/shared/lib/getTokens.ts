import {CharPosition, CharRange, Symbol, TokenObject, Tokens} from "../types/editor";
import {keywords, numberRegEx, lineBreak, whiteSpace, identifierRegEx, rBrace, lBrace, delimieters, eq, notEq, moreEq, lessEq, and, or, more, less} from "./tokens";

function isDelimiter(c: Symbol) {
  return delimieters.includes(c)
}

function isIdentifier(str: string) {
  return identifierRegEx.test(str)
}

function isKeyword(c: string) {
  return keywords.includes(c)
}

function isNumber(str: string) {
  return numberRegEx.test(str)
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

      if (char === lineBreak) {
        result.push(getToken(charRange, Tokens.LineBreak))
      }

      if (char === whiteSpace) {
        result.push(getToken(charRange, Tokens.WhiteSpace))
      }

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


      if (subStr === eq) {
        result.push(getToken(charRange, Tokens.Eq))
      }

      else if (subStr === notEq) {
        result.push(getToken(charRange, Tokens.NotEq))
      }

      else if (subStr === more) {
        result.push(getToken(charRange, Tokens.More))
      }

      else if (subStr === less) {
        result.push(getToken(charRange, Tokens.Less))
      }

      else if (subStr === moreEq) {
        result.push(getToken(charRange, Tokens.MoreEq))
      }

      else if (subStr === lessEq) {
        result.push(getToken(charRange, Tokens.LessEq))
      }

      else if (subStr === and) {
        result.push(getToken(charRange, Tokens.And))
      }

      else if (subStr === or) {
        result.push(getToken(charRange, Tokens.Or))
      }

      else if (isKeyword(subStr)) {
        result.push(getToken(charRange, Tokens.Keyword))
      }

      else if (isNumber(subStr)) {
        result.push(getToken(charRange, Tokens.Number))
      }

      else if (isIdentifier(subStr)) {
        result.push(getToken(charRange, Tokens.Identifier))
      }

      else {
        result.push(getToken(charRange, Tokens.Invalid))
      }

      left = right
    }
  }

  return result
}
