import {CItem} from '@shared/types/circulize'

function _circulize<T>(items: T[], n = 0, previous?: CItem<T>, onItem?: (item: T, cItem: CItem<T>) => void): CItem<T> | undefined {
  const item = items[n]

  if (item) {
    const currentItem: CItem<T> = {i: item}
    onItem?.(item, currentItem)
    const nextItem = _circulize(items, n + 1, currentItem, onItem)

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
  const map = new Map<T, CItem<T>>()
  const cItem = _circulize(items, 0, undefined, (item, cItem) => {
    map.set(item, cItem)
  })
  return {cItem, map}
}

export function copyCItem<T>(cItem: CItem<T> | undefined, p: (cItem: CItem<T>) => boolean) {
  return _copyCItem(cItem, p)
}

