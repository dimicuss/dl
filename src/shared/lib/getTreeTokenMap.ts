import {ExpressionObject} from "@shared/types/editor";
import {forEachTree} from "./mapTree";

export function getTreeTokenMap(tree: ExpressionObject) {
  const result = new Map<number, ExpressionObject[]>()

  forEachTree(tree, (child, chain) => {
    const {tokens} = child
    const parents = [child, ...chain]

    tokens.forEach(({charRange}) => {
      for (let i = charRange.start; i <= charRange.end; i++) {
        result.set(i, parents)
      }
    })
  })

  return result
}
