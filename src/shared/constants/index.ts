import {Atom, Expression} from "shared/types/editor"

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
