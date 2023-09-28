import {CItem} from '@shared/types/circulize'

function createList<T>(items: T[], n = 0, previous?: CItem<T>): CItem<T> | undefined {
  const item = items[n]

  if (item) {
    const currentItem: CItem<T> = {i: item}
    const nextItem = createList(items, n + 1, currentItem)

    currentItem.p = previous
    currentItem.n = nextItem

    return currentItem
  }

  return undefined
}

export function circulize<T>(items: T[]) {
  return createList(items)
}

