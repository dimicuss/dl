import {useEffect, useRef} from "react"



export const Editor = () => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    console.log(ref.current)
  }, [])

  return <div ref={ref}></div>
}
