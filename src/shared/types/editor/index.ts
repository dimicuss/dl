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
  LBrace = 'l_brace',
  RBrace = 'r_brace',
  LineBreak = 'line_break',
  WhiteSpace = 'white_space',
  Expression = 'expression',
  Atom = 'atom'
}

export interface TokenObject {
  type: Tokens
  charRange: CharRange
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
  Atom = 'atom'
}

export enum Atom {
  String = 'string',
  Number = 'number',
  Keyword = 'keyword',
  Invalid = 'invalid',
}

export interface ExpressionObject {
  type: Expression
  atomType?: Atom
  tokens: TokenObject[]
  children: ExpressionObject[]
  errors: Error[]
  closed: boolean
  completions: AutoCompleteItem[]
}


export interface TreeTokenMap {
  map: Map<number, ExpressionObject[]>
  maxIndex: number
  minIndex: number
}

export interface AutoCompleteItem {
  start: number | undefined
  end: number | undefined
  completions: string[]
}

export interface Error {
  start?: number
  end?: number
  text: string
}
