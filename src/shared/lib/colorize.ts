import {Schema} from "prosemirror-model"
import {Transaction} from "prosemirror-state"
import {getSyntaxTree} from "./getSyntaxTree"
import {getCharPositions} from "./getChars"
import {getTokens} from "./getTokens"

export function colorize(t: Transaction, schema: Schema) {
  const tokens = getTokens(getCharPositions(t.doc))

  const tree = getSyntaxTree(tokens)

  console.log(tree)

  return tokens.reduce((t, token) => {
    const {type, charRange} = token
    const {start, end} = charRange
    return t.addMark(start, end + 1, schema.marks[type].create())
  }, t.removeMark(0, t.doc.content.size))
}
