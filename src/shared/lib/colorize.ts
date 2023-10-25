import {ExpressionObject} from '@shared/types/editor'
import {Schema} from 'prosemirror-model'
import {Transaction} from "prosemirror-state"


export function colorize(t: Transaction, schema: Schema, tree: ExpressionObject[] = []): Transaction {
  return tree.reduce((t, expression) => {
    const {tokens, atomType, type, errors} = expression

    const colorizedT = tokens.reduce((t, {charRange}) => {
      const mark = schema.marks[atomType || type]
      const {start, end} = charRange
      return mark ? t.addMark(start, end + 1, mark.create()) : t
    }, t)

    const errorredT = errors.reduce((t, {start, end, text}) => {
      const mark = schema.marks.error
      const handledStart = start || 0
      const handledEnd = end ? end + 1 : t.doc.content.size
      return mark ? t.addMark(handledStart, handledEnd, mark.create({'data-error': text})) : t
    }, colorizedT)

    return colorize(errorredT, schema, expression.children)
  }, t)
}
