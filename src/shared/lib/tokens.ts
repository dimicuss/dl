import {LineBreak, Symbol} from '../types/editor'

export const lineBreak: LineBreak = {}
export const lBrace = '('
export const rBrace = ')'
export const whiteSpace = ' '

export const keywords = [
  'Фамилия',
  'Имя',
  'Отчество',
  'Возраст'
]

export const eq = '='
export const notEq = '!='
export const moreEq = '>='
export const lessEq = '<='
export const more = '>'
export const less = '<'
export const and = '&&'
export const or = '||'

export const expressionTokens = [eq, notEq, moreEq, lessEq, more, less, and, or]

export const numberRegEx = /^-?\d+(\.\d+)?$/

export const stringRegEx = /^[\w]+$/

export const delimieters: Symbol[] = [
  whiteSpace,
  lineBreak,
]
