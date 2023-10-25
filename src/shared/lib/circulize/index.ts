import {CItem} from '@shared/types/circulize'

function _circulize<T>(items: T[], n = 0, previous?: CItem<T>): CItem<T> | undefined {
  const item = items[n]

  if (item) {
    const currentItem: CItem<T> = {i: item}
    const nextItem = _circulize(items, n + 1, currentItem)

    currentItem.p = previous
    currentItem.n = nextItem

    return currentItem
  }

  return undefined
}

function _copyCItem<T>(cItem: CItem<T> | undefined, p: (cItem: CItem<T>) => boolean, previous?: CItem<T>): CItem<T> | undefined {
  if (cItem && p(cItem)) {
    const currentItem: CItem<T> = {i: cItem.i}
    const nextItem = _copyCItem(cItem?.n, p, currentItem)

    currentItem.p = previous
    currentItem.n = nextItem

    return currentItem
  }

  return undefined
}


export function findCItem<T>(cItem: CItem<T> | undefined, p: (i: CItem<T>) => boolean) {
  let founded: CItem<T> | undefined
  let current = cItem

  while (current && founded === undefined) {
    if (p(current)) {
      founded = current
    }

    current = current.n
  }

  return founded
}

export function circulize<T>(items: T[]) {
  return _circulize(items)
}

export function copyCItem<T>(cItem: CItem<T> | undefined, p: (cItem: CItem<T>) => boolean) {
  return _copyCItem(cItem, p)
}

