import {useEffect, useState} from "react"
import {Container} from "react-dom"
import {Point} from "shared/types/point"
import styled from "styled-components"

function findEl(el: HTMLElement) {
  let currentEl: HTMLElement | null = el
  let foundedEl: HTMLElement | null = null

  while (currentEl && !foundedEl) {
    if (currentEl.getAttribute('class') === 'error' && currentEl.getAttribute('data-error')) {
      foundedEl = currentEl
    }

    currentEl = currentEl.parentElement
  }

  return foundedEl
}

export const Error = () => {
  const [state, setState] = useState<State | undefined>()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = findEl(e.target as HTMLElement)
      if (target) {
        setState({
          point: {
            x: e.clientX,
            y: e.clientY,
          },
          text: target.getAttribute('data-error') || ''
        })
      } else {
        setState(undefined)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  if (state) {
    const style = {
      transform: `translate(${state.point.x + 10}px, ${state.point.y + 10}px)`
    }

    return (
      <Container style={style}>
        {state.text}
      </Container>
    )
  }

  return null
}

interface State {
  text: string
  point: Point
}

const Container = styled.div`
  position: fixed;
  min-width: 100px;
  max-width: 300px;
  background-color: black;
  color: white;
`
