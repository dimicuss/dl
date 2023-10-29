import {CItem} from 'shared/types/circulize'

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




