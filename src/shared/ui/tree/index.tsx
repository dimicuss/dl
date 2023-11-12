import {styled} from "styled-components"
import {ExpressionObject, Expression} from "shared/types/editor"
import {colorStyles} from "shared/constants"
import {EditorView} from "prosemirror-view"
import {useEffect, useState} from "react"
import {dlPlugin} from "shared/lib/dlPlugin"

const ExpressionObjectRenderer = ({object}: {object: ExpressionObject}) => {
  const {type, tokens, children, atomType} = object

  return type === Expression.Atom
    ? tokens.map(({charRange}, i) => <div key={i} className={atomType}>{charRange.range}</div>)
    : (
      <div>
        <div className={type}>{type}</div>
        <Children>
          {children.map((child, i) => (<ExpressionObjectRenderer object={child} key={i} />))}
        </Children>
      </div>
    )
}

export const Tree = ({view}: {view: EditorView}) => {
  const [tree, setTree] = useState(dlPlugin.getState(view.state) || [])

  useEffect(() => {
    view.setProps({
      dispatchTransaction: (tr) => {
        view.updateState(view.state.apply(tr))
        setTree(dlPlugin.getState(view.state) || [])
      }
    })
  }, [view])

  return (
    <Container>
      {tree.map((expression, i) => <ExpressionObjectRenderer key={i} object={expression} />)}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  ${colorStyles}
`

const Children = styled.div`
  padding-left: 20px;
  border-left: 1px solid gray;
`
