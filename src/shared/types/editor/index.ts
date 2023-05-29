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
  Number = 'number',
  Keyword = 'keyword',
  Invalid = 'invalid',
  LBrace = 'l_brace',
  RBrace = 'r_brace',
  LineBreak = 'line_break',
  WhiteSpace = 'white_space',
  Eq = 'eq',
  NotEq = 'not_eq',
  More = 'more',
  Less = 'less',
  MoreEq = 'more_eq',
  LessEq = 'less_eq',
  And = 'and',
  Or = 'or'
}

export enum Segments {
  Expression = 'expression',
  LogOperator = 'log_operator'
}

export interface TokenObject {
  type: Tokens
  charRange: CharRange
}

export interface SegmentObject {
  type: Segments
  tokens: TokenObject[]
  left: TokenObject[]
  error?: Error
}
