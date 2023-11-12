import {Atom, Expression} from "shared/types/editor"
import {LineBreak} from 'shared/types/editor'

export const colorMap = new Map<Expression | Atom, string>([
  [Atom.Invalid, 'red'],
  [Atom.Number, '#AE81FF'],
  [Atom.String, '#C0B863'],
  [Atom.Keyword, '#66D9EF'],
  [Expression.Eq, '#E6256B'],
  [Expression.NotEq, '#E6256B'],
  [Expression.MoreEq, '#E6256B'],
  [Expression.More, '#E6256B'],
  [Expression.Less, '#E6256B'],
  [Expression.LessEq, '#E6256B'],
  [Expression.Braced, '#E6256B'],
  [Expression.And, '#E6256B'],
  [Expression.Or, '#E6256B']
])

export const colorStyles = [...colorMap]
  .map(([className, color]) => `.${className} { color: ${color}; }`)
  .join('\n')


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
export const quote = '"'

export const orOr = `${or}${or}`
export const notEq = `${not}${eq}`
export const moreEq = `${more}${eq}`
export const lessEq = `${less}${eq}`
export const andAnd = `${and}${and}`

export const numberRegEx = /^-?\d+(\.\d+)?$/

export const stringRegEx = /^".*"$/
