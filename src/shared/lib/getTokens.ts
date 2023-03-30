import {CharPosition, CharRange, Symbol, Token, Tokens} from "../types/editor";
import {keywords, operators, numberRegEx, lineBreak, whiteSpace, identifierRegEx, rBrace, lBrace} from "./tokens";

function isRBrace(c: Symbol) {
  return c === lBrace
}

function isLBrace(c: Symbol) {
  return c === rBrace
}

function isWhiteSpace(c: Symbol) {
  return c === whiteSpace
}

function isLineBreak(c: Symbol) {
  return c === lineBreak
}

function isDelimiter(c: Symbol) {
  return isWhiteSpace(c) || isLineBreak(c) || isRBrace(c) || isLBrace(c)
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

function isOperator(c: string) {
  return operators.includes(c)
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

function getToken(charRange: CharRange, type: Tokens): Token {
  return {
    type,
    charRange
  }
}

export function getTokens(chars: CharPosition[]) {
  let left = 0
  let right = 0
  let len = chars.length
  const result: Token[] = []

  while (right < len && left <= right) {
    const currentCharP = chars[right]
    const char = currentCharP.char
    const previousChar = chars[right - 1]?.char

    if (!isDelimiter(char)) {
      right++
    }

    if (isDelimiter(char) && left === right) {
      const charRange = getCharRange([currentCharP])

      if (isLineBreak(char)) {
        result.push(getToken(charRange, Tokens.LineBreak))
      }

      if (isWhiteSpace(char)) {
        result.push(getToken(charRange, Tokens.WhiteSpace))
      }

      if (isRBrace(char)) {
        result.push(getToken(charRange, Tokens.RBrace))
      }

      if (isLBrace(char)) {
        result.push(getToken(charRange, Tokens.LBrace))
      }

      right++
      left = right
    } else if (isDelimiter(char) && left !== right || right === len && left !== right) {
      const subChars = getSubChars(chars, left, right - 1);
      const charRange = getCharRange(subChars)
      const subStr = charRange.range

      if (isOperator(subStr)) {
        result.push(getToken(charRange, Tokens.Operator))
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
