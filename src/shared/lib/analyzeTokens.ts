import {Token, Tokens} from "../types/editor";

const  =[
  Tokens
]

export function analyzeTokens(tokens: Token[]) {
  if (tokens.length) {
    const token = tokens[0]

    console.log(token)
  }
}
