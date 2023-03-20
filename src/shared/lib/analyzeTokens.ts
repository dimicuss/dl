import {Token} from "../types/editor";

export function analyzeTokens(tokens: Token[]) {
  if (tokens.length) {
    const token = tokens[0]

    console.log(token)
  }
}
