import {LineBreak, Symbol} from '../types/editor'

export const lineBreak: LineBreak = {}
export const lBrace = '('
export const rBrace = ')'
export const whiteSpace = ' '
export const delimieters: Symbol[] = [
  lBrace,
  rBrace,
  whiteSpace,
  lineBreak
]

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
export const and = '&'
export const or = '|'

export const numberRegEx = /^-?\d+(\.\d+)?$/

export const stringRegEx = /^[a-zA-Zа-яА-Я]+$/
