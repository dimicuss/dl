import {TreeTokenMap} from "@shared/types/editor";
import {Selection} from "prosemirror-state"


export function getAutoComplete(treeTokenMap: TreeTokenMap, selection: Selection) {
  const {anchor} = selection
  let currentAnchor = anchor
  while (currentAnchor > 0) {
    const expressions = treeTokenMap.get(currentAnchor) || []
    const unclosedExpression = expressions.find(({closed}) => !closed)

    if (unclosedExpression) {
      const token = unclosedExpression.tokens[0]

      if (token) {
        const {start, end} = token.charRange

        if (anchor < start) {
          return unclosedExpression.leftAutoComplete
        }

        if (anchor > end) {
          return unclosedExpression.rightAutoComplete
        }
      }

      return undefined
    }

    currentAnchor--
  }

  return undefined
}
