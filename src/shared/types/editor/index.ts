import {Node} from "prosemirror-model"

export interface TextRange {
  start: number
  end: number
  text: string
}
