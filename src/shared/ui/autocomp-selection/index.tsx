import {AutoComp} from "@shared/types/autocomp"
import {CSSProperties} from "react"
import styled from "styled-components"


export const AutoCompSelection = ({object}: Props) => {
  const {x, y, completions} = object

  const style: CSSProperties = {
    transform: `translate(${x}px, ${y + 20}px)`
  }

  return (
    <Container style={style}>
      Completions
    </Container>
  )
}

interface Props {
  object: AutoComp
}

const Container = styled.div`
  position: fixed;
  background-color: yellow;
`
