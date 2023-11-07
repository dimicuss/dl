import {AutoComp} from "shared/types/autocomp"
import {CSSProperties, useEffect, useState} from "react"
import styled from "styled-components"
import {ExpressionObject} from "shared/types/editor"
import {EditorView} from "prosemirror-view"
import {EditorState} from "prosemirror-state"
import {getAutoCompMap} from "shared/lib/getAutoCompMap"
import {useRefValue} from "shared/lib/useRefValue"
import {plugins} from "shared/constants"

export const AutoCompSelection = ({tree, editorState, getView}: Props) => {
  const [autoComp, setAutoComp] = useState<AutoComp | undefined>()
  const [autoCompPos, setAutoCompPos] = useState(0)
  const getAutoComp = useRefValue(autoComp)

  useEffect(() => {
    const windowSelection = window.getSelection()
    const view = getView()
    if (view) {
      if (editorState && tree && windowSelection && windowSelection.type === 'Caret') {
        const {x, y} = windowSelection.getRangeAt(0).getBoundingClientRect()
        const completions = tree
          .map((t) => getAutoCompMap(t, editorState).get(editorState.selection.anchor))
          .find((completion) => completion && completion.length)

        if (completions && x > 0 && y > 0) {
          setAutoComp({
            x,
            y,
            completions
          })
          view.updateState(view.state.reconfigure({plugins: []}))
        } else {
          setAutoComp(undefined)
          view.updateState(view.state.reconfigure({plugins}))
        }
      } else {
        setAutoComp(undefined)
        view.updateState(view.state.reconfigure({plugins}))
      }
    }
  }, [tree, editorState])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const autoComp = getAutoComp()
      const view = getView()
      if (autoComp && view) {
        const {key} = e

        if (key === 'ArrowUp') {
          e.preventDefault()
          setAutoCompPos((pos) => Math.max(pos - 1, 0))
        }

        if (key === 'ArrowDown') {
          e.preventDefault()
          setAutoCompPos((pos) => Math.min(pos + 1, autoComp.completions.length - 1))
        }

        if (key === 'Enter') {
        }
      } else {
        setAutoCompPos(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (autoComp) {
    const {x, y, completions} = autoComp
    const style: CSSProperties = {
      transform: `translate(${x}px, ${y + 20}px)`
    }

    return (
      <Container style={style}>
        {completions.map((c, i) => {
          const current = i === autoCompPos
          return (
            <Selection key={i} data-current={current}>{c}</Selection>
          )
        })}
      </Container>
    )
  }

  return null
}

interface Props {
  tree: ExpressionObject[]
  editorState: EditorState | undefined
  getView: () => EditorView | undefined
}

const Container = styled.div`
  position: fixed;
  background-color: yellow;
`

const Selection = styled.div`
  &[data-current='true'] {
    background-color: red;
  }
`
