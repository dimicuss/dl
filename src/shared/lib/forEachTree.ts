export function forEachTree<T extends {children: T[]}>(tree: T, fn: (tree: T, chain: T[]) => void, parentChain: T[] = []) {
  const {children} = tree
  const updatedParentChain = [tree, ...parentChain]

  fn(tree, parentChain)

  children.forEach((child) => {
    forEachTree(child, fn, updatedParentChain)
  })
}
