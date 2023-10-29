import {EditorState} from "prosemirror-state"
import {ExpressionObject} from "shared/types/editor";
import {forEachTree} from "./mapTree";

export function getAutoCompMap(tree: ExpressionObject, editorState: EditorState) {
  const map = new Map<number, string[]>()

  forEachTree(tree, (child) => {
    const {completions} = child

    completions.forEach(({start, end, completions}) => {
      const handledStart = start ? start + 2 : 1
      const handledEnd = end ? end - 1 : editorState.doc.content.size - 1

      for (let i = handledStart; i <= handledEnd; i++) {
        map.set(i, completions)
      }
    })
  })

  return map
}
