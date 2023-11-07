import {baseKeymap} from "prosemirror-commands"
import {history, undo, redo} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import {Atom, Expression} from "shared/types/editor"

keymap

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


import {LineBreak} from 'shared/types/editor'

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

export const plugins = [
  history(),
  keymap({
    ...baseKeymap,
    'Mod-z': undo,
    'Mod-y': redo,
  }),
]
