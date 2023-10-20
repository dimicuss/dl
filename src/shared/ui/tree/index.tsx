import {styled} from "styled-components"
import {ExpressionObject, Expression} from "@shared/types/editor"

const ExpressionObjectRenderer = ({object}: {object: ExpressionObject}) => {
  const {type, children = []} = object
  const everyChildIsAtom = children.length > 0 && children.every(({type}) => type === Expression.Atom)


  return (
    <Body data-row={everyChildIsAtom}>
      <Name>{type}</Name>
      {everyChildIsAtom
        ? (
          <Tokens>
            {children.flatMap(({tokens}, i) => tokens.map(({charRange}) => <Token key={i}>{charRange.range}</Token>))}
          </Tokens>
        )
        : (
          <Children>
            {children.map((child, i) => <ExpressionObjectRenderer object={child} key={i} />)}
          </Children>
        )}
    </Body>
  )
}

export const Tree = ({tree}: {tree: ExpressionObject[]}) => {
  return (
    <Container>
      {tree.map((expression) => <ExpressionObjectRenderer object={expression} />)}
    </Container>
  )
}

const Body = styled.div`
  &[data-row='true'] {
    display: flex;
    column-gap: 5px;
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
`

const Name = styled.div`
  
`

const Children = styled.div`
  padding-left: 20px;
  border-left: 1px solid black;
`

const Tokens = styled.div`
  display: flex;
  column-gap: 5px;
`

const Token = styled.div`
  
`


