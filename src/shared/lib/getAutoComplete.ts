import {TreeTokenMap} from "@shared/types/editor";
import {Selection} from "prosemirror-state"


export function getAutoComplete(treeTokenMap: TreeTokenMap, selection: Selection) {
  let currentAnchor = selection.anchor
  while (currentAnchor > 0) {
    const expressions = treeTokenMap.get(currentAnchor) || []
    const unclosedExpression = expressions.find(({closed}) => !closed)

    if (unclosedExpression) {
      return unclosedExpression
    }

    currentAnchor--
  }

  return undefined
}
