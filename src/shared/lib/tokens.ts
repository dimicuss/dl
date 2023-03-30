import {LineBreak} from '../types/editor'

export const lineBreak: LineBreak = {}

export const lBrace = '('
export const rBrace = ')'
export const whiteSpace = ' '

export const keywords = [
  'Фамилия',
  'Имя',
  'Отчество',
]

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
