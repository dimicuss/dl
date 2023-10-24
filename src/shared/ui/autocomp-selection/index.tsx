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
      {completions.map((c, i) => <div key={i}>{c}</div>)}
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
