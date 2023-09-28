export type CItem<T> = {
  i: T
  n?: CItem<T>
  p?: CItem<T>
}
