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
  String = 'string',
  Number = 'number',
  Keyword = 'keyword',
  Invalid = 'invalid',
  LBrace = 'l_brace',
  RBrace = 'r_brace',
  LineBreak = 'line_break',
  WhiteSpace = 'white_space',
  Expression = 'expression',
  And = 'and',
  Or = 'or'
}

export enum Segments {
  Expression = 'expression',
  LogOperator = 'log_operator',
  RBrace = 'r_brace',
  LBrace = 'l_brace'
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

export enum Expression {
  Eq = 'eq',
  NotEq = 'not_eq',
  More = 'more',
  Less = 'less',
  MoreEq = 'more_eq',
  LessEq = 'less_eq',
  Or = 'or',
  And = 'and',
  Braced = 'braced',
  RBrace = 'r_brace'
}

export interface ExpressionObject {
  type: Expression
  tokens?: TokenObject[]
  children?: ExpressionObject[]
  closed: boolean
  comment?: string[]
}

