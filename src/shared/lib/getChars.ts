import {Node} from "prosemirror-model";
import {Char} from "../types/editor";
import {blockSeparator} from "./tokens";

export function getChars(doc: Node) {
  let result: Char[] = []

  doc.descendants((node, pos) => {
    if (node.isBlock && pos > 0) {
      result.push({
        pos,
        char: blockSeparator
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


