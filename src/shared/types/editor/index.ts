export type LineBreak = {}

export type Symbol = string | LineBreak

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
  Identifier = 'identifier',
  Operator = 'operator',
  Number = 'number',
  Keyword = 'keyword',
  Invalid = 'invalid',
  LBrace = 'l_brace',
  RBrace = 'r_brace',
  LineBreak = 'line_break',
  WhiteSpace = 'white_space'
}

export interface Token {
  type: Tokens
  charRange: CharRange
}
