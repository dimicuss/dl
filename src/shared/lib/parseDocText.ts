import {Node} from "prosemirror-model";
import {TextRange} from "../types/editor";

export function parseDocText(doc: Node) {
  let result: TextRange[] = []

  doc.descendants((node, pos) => {
    if (node.isText) {
      const text = node.textContent
      result.push({
        start: pos,
        end: pos + text.length,
        text
      })
    }
  })

  return result
}

