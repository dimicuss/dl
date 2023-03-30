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
]

export const eq = '='
export const notEq = '!='
export const moreEq = '>='
export const lessEq = '<='
export const and = '&'
export const or = '|'
export const operators = [
  '=',
  '!=',
  '>=',
  '<=',
  '&',
  '|',
]

export const numberRegEx = /^-?\d+(\.\d+)?$/

export const identifierRegEx = /^[a-zA-Zа-яА-Я]+$/
