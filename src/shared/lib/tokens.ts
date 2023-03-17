import {Symbol} from '../types/editor'

export const blockSeparator = {}

export const keywords: Symbol[] = [
  'Фамилия',
  'Имя',
  'Отчество',
]

export const operators: Symbol[] = [
  '=',
  '!',
  '>',
  '<',
  '&',
  '|',
]

export const delimiters: Symbol[] = [
  '(',
  ')',
  ' ',
  blockSeparator,
]

export const numbers: Symbol[] = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
]

export const numberRegEx = /^-?\d+(\.\d+)?$/i
