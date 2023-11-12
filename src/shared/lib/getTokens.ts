import {CItem} from "shared/types/circulize";
import {CharPosition, TokenObject, Tokens} from "../types/editor";
import {rBrace, lBrace, whiteSpace, lineBreak, eq, not, more, less, and, or, quote} from "shared/constants";

function getToken(type: Tokens, ...chars: CharPosition[]): TokenObject {
  const range = chars.reduce((result, {char}) => result + char, '')

  const charRange = {
    start: chars?.[0]?.pos as number,
    end: chars?.[chars.length - 1]?.pos as number,
    range,
  }

  return {
    type,
    charRange
  }
}

const atomDelimiters = [quote, lineBreak, whiteSpace]

export function getTokens(chars: CharPosition[]): CItem<TokenObject> | undefined {
  let result: CItem<TokenObject> | undefined
  let currentResult: CItem<TokenObject> | undefined

  const linkCurrentResult = (type: Tokens, ...chars: CharPosition[]) => {
    const newItem = getToken(type, ...chars)

    if (currentResult) {
      const newCurrentResult = {
        i: newItem,
        p: currentResult
      }

      currentResult.n = newCurrentResult
      currentResult = newCurrentResult
    } else {
      currentResult = {
        i: newItem
      }
      result = currentResult
    }
  }

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i] as CharPosition
    const pC = chars[i - 1]
    const nC = chars[i + 1]

    if (c.char !== whiteSpace && c.char !== lineBreak) {
      if (c.char === quote) {
        const quotedChars: CharPosition[] = [c]

        let j = i + 1
        while (j < chars.length) {
          const cJ = chars[j] as CharPosition

          if (cJ.char !== lineBreak) {
            quotedChars.push(cJ)
          }

          if (cJ.char === quote) {
            break
          }

          j++
        }

        linkCurrentResult(Tokens.Atom, ...quotedChars)
        i = j
      } else if (c.char === more || c.char === less) {
        if (nC?.char === eq) {
          linkCurrentResult(Tokens.Expression, c, nC)
          i++
        } else {
          linkCurrentResult(Tokens.Expression, c)
        }
      } else if (c.char === or) {
        if (nC?.char === or) {
          linkCurrentResult(Tokens.Expression, c, nC)
          i++
        } else {
          linkCurrentResult(Tokens.Atom, c)
        }
      } else if (c.char === and) {
        if (nC?.char === and) {
          linkCurrentResult(Tokens.Expression, c, nC)
          i++
        } else {
          linkCurrentResult(Tokens.Atom, c)
        }
      } else if (c.char === not) {
        if (nC?.char === eq) {
          linkCurrentResult(Tokens.Expression, c, nC)
          i++
        } else {
          linkCurrentResult(Tokens.Atom, c)
        }
      } else if (c.char === eq) {
        linkCurrentResult(Tokens.Expression, c)
      } else if (c.char === lBrace) {
        linkCurrentResult(Tokens.LBrace, c)
      } else if (c.char === rBrace) {
        linkCurrentResult(Tokens.RBrace, c)
      } else if (currentResult?.i?.type === Tokens.Atom && (pC?.char === undefined || !atomDelimiters.includes(pC.char))) {
        currentResult.i.charRange = {
          start: currentResult.i.charRange.start,
          end: c.pos,
          range: currentResult.i.charRange.range + c.char
        }
      } else {
        linkCurrentResult(Tokens.Atom, c)
      }
    }
  }

  return result
}

