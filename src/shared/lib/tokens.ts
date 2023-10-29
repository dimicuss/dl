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
export const or = '|'
export const and = '&'
export const not = '!'
export const more = '>'
export const less = '<'

export const orOr = `${or}${or}`
export const notEq = `${not}${eq}`
export const moreEq = `${more}${eq}`
export const lessEq = `${less}${eq}`
export const andAnd = `${and}${and}`

export const numberRegEx = /^-?\d+(\.\d+)?$/

export const stringRegEx = /^[a-zA-Zа-яА-Я0-9]+$/

export const delimiters: Symbol[] = [
  eq,
  more,
  less,
  not,
  and,
  or
]
