import {styled} from "styled-components"
import {ExpressionObject, Expression} from "@shared/types/editor"
import {colorStyles} from "@shared/constants"

const ExpressionObjectRenderer = ({object}: {object: ExpressionObject}) => {
  const {type, children = []} = object

  return (
    <div>
      <div className={type}>{type}</div>
      <Children>
        {children.map((child, i) => {
          const {tokens, type, atomType} = child
          return type === Expression.Atom
            ? tokens.map(({charRange}) => <div className={atomType} key={i}>{charRange.range}</div>)
            : <ExpressionObjectRenderer object={child} key={i} />
        })}
      </Children>
    </div>
  )
}

export const Tree = ({tree}: {tree: ExpressionObject[]}) => {
  return (
    <Container>
      {tree.map((expression) => <ExpressionObjectRenderer object={expression} />)}
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
