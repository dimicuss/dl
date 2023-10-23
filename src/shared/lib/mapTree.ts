import {ExpressionObject} from '@shared/types/editor'

export function forEachTree(tree: ExpressionObject, fn: (tree: ExpressionObject, chain: ExpressionObject[]) => void, parentChain: ExpressionObject[] = []) {
  const {children} = tree
  const updatedParentChain = [tree, ...parentChain]

  fn(tree, parentChain)

  children.forEach((child) => {
    forEachTree(child, fn, updatedParentChain)
  })
}
