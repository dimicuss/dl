import {Plugin, PluginKey} from "prosemirror-state"
import {getTokens} from "shared/lib/getTokens"
import {getCharPositions} from "shared/lib/getCharPositions"
import {getSyntaxTree} from "shared/lib/getSyntaxTree"
import {ExpressionObject} from "shared/types/editor"
import {colorize} from "./colorize"

export const dlKey = new PluginKey<ExpressionObject[]>('dlKey')

export const dlPlugin = new Plugin<ExpressionObject[]>({
  key: dlKey,
  state: {
    init: (_, editorState) => getSyntaxTree(getTokens(getCharPositions(editorState.doc))),
    apply: (t) => getSyntaxTree(getTokens(getCharPositions(t.doc)))
  },
  appendTransaction: (_, __, editorState) => {
    const tree = dlKey.getState(editorState) || []
    const t = editorState.tr
    const schema = editorState.schema

    return colorize(t.removeMark(0, t.doc.content.size), schema, tree)
  }
})
