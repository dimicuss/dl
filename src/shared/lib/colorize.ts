import {Schema} from "prosemirror-model"
import {Transaction} from "prosemirror-state"
import {getCharPositions} from "./getChars"
import {getTokens} from "./getTokens"



export function colorize(t: Transaction, schema: Schema) {
  const tokens = getTokens(getCharPositions(t.doc))
  return tokens.reduce((t, token) => {
    const {type, charRange} = token
    const {start, end} = charRange
    return t.addMark(start, end + 1, schema.marks[type].create())
  }, t.removeMark(0, t.doc.content.size))
}
