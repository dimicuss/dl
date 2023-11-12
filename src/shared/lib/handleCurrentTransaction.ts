import {Schema} from "prosemirror-model"
import {Transaction} from "prosemirror-state"
import {getCharPositions} from "./getCharPositions"
import {getTokens} from "./getTokens"
import {getSyntaxTree} from "./getSyntaxTree"
import {colorize} from "./colorize"

export function handleCurrentTransaction(t: Transaction, schema: Schema) {
  const tree = getSyntaxTree(getTokens(getCharPositions(t.doc)))
  const colorizedState = colorize(t.removeMark(0, t.doc.content.size), schema, tree)

  return {
    tree,
    colorizedState,
  }
} 
