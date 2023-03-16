import {delimiters, keywords, numbers, operators} from "./tokens";

const numberRegEx = /^-?\d+(\.\d+)?$/i

function isOperator(c: string) {
  return operators.includes(c)
}

function isDelimiter(c: string | {}) {
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


