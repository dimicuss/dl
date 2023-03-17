export type Symbol = string | {}

export interface CharPosition {
  pos: number
  char: Symbol
}

export interface CharRange {
  start: number
  end: number
  range: string
}

export enum Tokens {
  Delimiter = 'delimiter',
  Identifier = 'identifier',
  Operator = 'operator',
  Number = 'number',
  Keyword = 'keyword',
  Invalid = 'invalid'
}

export interface Token {
  type: Tokens
  charRange: CharRange
}
