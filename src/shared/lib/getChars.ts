import {Node} from "prosemirror-model";
import {CharPosition} from "../types/editor";
import {lineBreak} from "./tokens";

export function getCharPositions(doc: Node) {
  let result: CharPosition[] = []

  doc.descendants((node, pos) => {
    if (node.isBlock && pos > 0) {
      result.push({
        pos,
        char: lineBreak
      })
    }

    if (node.isText) {
      const text = node.textContent
      for (let i = 0; i < text.length; i++) {
        result.push({
          pos: pos + i,
          char: text[i]
        })
      }
    }
  })

  return result
}


