import {AutoComp} from "shared/types/autocomp"
import {CSSProperties, useEffect, useState} from "react"
import styled from "styled-components"
import {EditorView} from "prosemirror-view"
import {getAutoCompMap} from "shared/lib/getAutoCompMap"
import {useRefValue} from "shared/lib/useRefValue"
import {dlKey} from "shared/lib/dlPlugin"

export const AutoCompSelection = ({view}: Props) => {
  const [autoComp, setAutoComp] = useState<AutoComp | undefined>()
  const [autoCompPos, setAutoCompPos] = useState(0)
  const getAutoComp = useRefValue(autoComp)
  const getAutoCompPos = useRefValue(autoCompPos)

  useEffect(() => {
    const handleSelectionChange = () => {
      const windowSelection = window.getSelection()
      const editorState = view.state
      const tree = dlKey.getState(editorState) || []

      if (windowSelection && windowSelection.type === 'Caret') {
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
        } else {
          setAutoComp(undefined)
        }
      } else {
        setAutoComp(undefined)
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [view])

  useEffect(() => {
    view.setProps({
      handleKeyDown: (_, e) => {
        const autoComp = getAutoComp()
        const autoCompPos = getAutoCompPos()
        if (autoComp) {
          const {key} = e

          if (key === 'ArrowUp') {
            setAutoCompPos((pos) => Math.max(pos - 1, 0))
            return true
          }

          if (key === 'ArrowDown') {
            setAutoCompPos((pos) => Math.min(pos + 1, autoComp.completions.length - 1))
            return true
          }

          if (key === 'Enter') {
            const autoCompletion = autoComp.completions[autoCompPos] as string
            view.dispatch(view.state.tr.insertText(autoCompletion))
            setAutoComp(undefined)
            setAutoCompPos(0)
            return true
          }
        } else {
          setAutoCompPos(0)
        }
      }
    })

    const handleScroll = () => {
      setAutoComp(undefined)
      setAutoCompPos(0)
    }

    document.addEventListener('scroll', handleScroll)

    return () => {
      view.setProps({handleKeyDown: undefined})
      document.removeEventListener('scroll', handleScroll)
    }
  }, [view])

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
  view: EditorView
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
