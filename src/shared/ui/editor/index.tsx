import {useEffect, useRef} from "react"
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {keymap} from "prosemirror-keymap"
import {undo, redo, history} from "prosemirror-history"
import {DOMOutputSpec, Schema} from "prosemirror-model"

const divEl: DOMOutputSpec = ['div', {class: 'Super'}, 0]

const initialState = {
  doc: {
    type: "doc",
    content: [
      {
        type: "super_expression",
        content: [
          {
            type: 'expression',
            content: [
              {
                type: 'entity',
              },
              {
                type: 'operator',
              },
              {
                type: 'value',
                content: [
                  {type: 'text', text: 'Initial text'}
                ]
              }
            ]
          },
        ]
      }
    ]
  },
  selection: {
    type: "text",
    anchor: 0,
    head: 0
  }
}

export const Editor = () => {
  const ref = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<EditorView | null>(null)


  useEffect(() => {
    const view = new EditorView(ref.current, {
      state: EditorState.fromJSON({
        schema: new Schema({
          nodes: {
            'doc': {
              content: '(super_expression | text)*'
            },
            'super_expression': {
              content: '(expression | log_operator | l_brace | r_brace | text)+',
              inline: true,
              toDOM: () => divEl
            },
            'expression': {
              content: '(entity | operator | value | text)+',
              inline: true,
              toDOM: () => divEl
            },
            'log_operator': {
              atom: true,
              inline: true,
              toDOM: () => divEl
            },
            'l_brace': {
              atom: true,
              inline: true,
              toDOM: () => divEl
            },
            'r_brace': {
              atom: true,
              inline: true,
              toDOM: () => divEl
            },
            'entity': {
              atom: true,
              inline: true,
              toDOM: () => divEl
            },
            'operator': {
              atom: true,
              inline: true,
              toDOM: () => divEl
            },
            'value': {
              content: 'text*',
              inline: true,
              toDOM: () => divEl
            },
            'text': {}
          }
        }),
        plugins: [
          history(),
          keymap({
            'Mod-z': undo,
            'Mod-y': redo
          })
        ],
      }, initialState),
      dispatchTransaction(t) {
        const newState = view.state.apply(t)
        console.log(newState.toJSON())
        view.updateState(newState)
      }
    })

    editorRef.current = view

    return () => {
      editorRef.current?.destroy()
    }
  }, [])



  return <div ref={ref}></div>
}
