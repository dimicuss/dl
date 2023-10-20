import {createGlobalStyle, styled} from "styled-components"

import {Editor} from '@shared/ui/editor'


export const App = () => {
  return (
    <>
      <Container>
        <Editor />
      </Container>
      <GlobalStyles />
    </>
  )
}

const GlobalStyles = createGlobalStyle`
  html, body, #app-root {
    all: unset;
    height: 100vh; 
  }
`

const Container = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  background-color: #282C34;
`
