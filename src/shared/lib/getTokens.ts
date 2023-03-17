import {CharPosition, CharRange, Symbol, Token, Tokens} from "../types/editor";
import {delimiters, keywords, numbers, operators, numberRegEx} from "./tokens";

function isOperator(c: Symbol) {
  return operators.includes(c)
}

function isDelimiter(c: Symbol) {
  return delimiters.includes(c) || isOperator(c as string)
}


function isIdentifier(str: string) {
  const char = str[0]
  return !(numbers.includes(char) || isDelimiter(char))
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

    if (!isDelimiter(char))
      right++;

    if (isDelimiter(char) && left == right) {
      const charRange = getCharRange([currentCharP])
      if (isOperator(char)) {
        result.push(getToken(charRange, Tokens.Operator))
      } else {
        result.push(getToken(charRange, Tokens.Delimiter))
      }

      right++;
      left = right;
    } else if (isDelimiter(char) && left != right || (right == len && left != right)) {
      const subChars = getSubChars(chars, left, right - 1);
      const charRange = getCharRange(subChars)
      const subStr = charRange.range

      if (isKeyword(subStr)) {
        result.push(getToken(charRange, Tokens.Keyword))
      }

      else if (isNumber(subStr)) {
        result.push(getToken(charRange, Tokens.Number))
      }

      else if (isIdentifier(subStr) && !isDelimiter(previousChar)) {
        result.push(getToken(charRange, Tokens.Identifier))
      }

      else if (!isIdentifier(subStr) && !isDelimiter(previousChar)) {
        result.push(getToken(charRange, Tokens.Invalid))
      }

      left = right;
    }
  }

  return result
}
