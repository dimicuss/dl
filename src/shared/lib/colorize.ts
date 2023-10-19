import {ExpressionObject} from '@shared/types/editor'
import {Schema} from 'prosemirror-model'
import {Transaction} from "prosemirror-state"


export function colorize(t: Transaction, scheme: Schema, tree: ExpressionObject[] = []): Transaction {
  return tree.reduce((t, expression) => {
    const colorizedT = expression.tokens.reduce((t, token) => {
      const mark = scheme.marks[expression.atomType || expression.type]
      const {start, end} = token.charRange
      return mark ? t.addMark(start, end + 1, mark.create()) : t
    }, t)

    return colorize(colorizedT, scheme, expression.children)
  }, t)
}
