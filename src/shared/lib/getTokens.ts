import {CItem} from "shared/types/circulize";
import {CharPosition, CharRange, TokenObject, Tokens} from "../types/editor";
import {rBrace, lBrace, whiteSpace, lineBreak, eq, not, more, less, and, or} from "./tokens";

function getCharRange(chars: CharPosition[]): CharRange {
  const range = chars.reduce((result, {char}) => result + char, '')

  return {
    start: chars?.[0]?.pos as number,
    end: chars?.[chars.length - 1]?.pos as number,
    range,
  }
}

function getToken(type: Tokens, chars: CharPosition[]): TokenObject {
  return {
    type,
    charRange: getCharRange(chars)
  }
}

export function getTokens(chars: CharPosition[]): CItem<TokenObject> | undefined {
  let result: CItem<TokenObject> | undefined

  const linkResult = (newItem: TokenObject) => {
    if (result) {
      const newResult = {
        i: newItem,
        n: result
      }

      result.p = newResult
      result = newResult
    } else {
      result = {
        i: newItem
      }
    }
  }

  const replaceResult = (newItem: TokenObject) => {
    if (result) {
      const newResult = {
        i: newItem,
        n: result?.n
      }

      if (result.n) {
        result.n.p = newResult
      }
      result = newResult
    } else {
      result = {
        i: newItem
      }
    }


  }

  for (let i = chars.length - 1; i >= 0; i--) {
    const c = chars[i] as CharPosition
    const pC = chars[i - 1]
    const nC = chars[i + 1]

    if (c.char === eq) {
      if (pC?.char === not || pC?.char === more || pC?.char === less) {
        linkResult(getToken(Tokens.Expression, [pC, c]))
        i--
      } else {
        linkResult(getToken(Tokens.Expression, [c]))
      }
    } else if (c.char === more || c.char === less) {
      linkResult(getToken(Tokens.Expression, [c]))
    } else if (c.char === or) {
      if (pC?.char === or) {
        linkResult(getToken(Tokens.Expression, [pC, c]))
        i--
      } else {
        linkResult(getToken(Tokens.Atom, [c]))
      }
    } else if (c.char === and) {
      if (pC?.char === and) {
        linkResult(getToken(Tokens.Expression, [pC, c]))
        i--
      } else {
        linkResult(getToken(Tokens.Atom, [c]))
      }
    } else if (c.char === not) {
      linkResult(getToken(Tokens.Atom, [c]))
    } else if (c.char === lBrace) {
      linkResult(getToken(Tokens.LBrace, [c]))
    } else if (c.char === rBrace) {
      linkResult(getToken(Tokens.RBrace, [c]))
    }
    else if (c.char === whiteSpace || c.char === lineBreak) {
      continue
    } else {
      if (result?.i?.type === Tokens.Atom && (nC?.char !== whiteSpace && nC?.char !== lineBreak)) {
        replaceResult({
          type: Tokens.Atom,
          charRange: {
            start: c.pos,
            end: result.i.charRange.end,
            range: c.char + result.i.charRange.range
          }
        })
      } else {
        linkResult(getToken(Tokens.Atom, [c]))
      }
    }

  }

  return result
}

