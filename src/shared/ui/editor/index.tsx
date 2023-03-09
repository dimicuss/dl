import {useEffect, useRef} from "react"
import {schema} from 'prosemirror-schema-basic'
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {keymap} from "prosemirror-keymap"
import {splitBlock} from "prosemirror-commands"



export const Editor = () => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    new EditorView(ref.current, {
      state: EditorState.create({schema}),
      plugins: [
        keymap({'Enter': splitBlock})
      ],
    })
  }, [])

  return <div ref={ref}></div>
}
