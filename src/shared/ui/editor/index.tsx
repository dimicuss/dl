import {useEffect, useRef} from "react"
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {keymap} from "prosemirror-keymap"
import {undo, redo, history} from "prosemirror-history"
import {Schema} from "prosemirror-model"
import {baseKeymap} from "prosemirror-commands"

import styles from './index.css'

const initialState = {
  doc: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
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
      {
        type: 'paragraph',
        content: [
          {type: 'text', text: 'Some text'}
        ]
      }
    ]
  },
  selection: {
    type: "text",
    anchor: 17,
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
              content: 'paragraph*'
            },
            'paragraph': {
              content: '(log_operator | l_brace | r_brace | entity | operator | value | text)*',
              toDOM: () => ['p', {class: styles.paragraph}, 0],
            },
            'log_operator': {
              atom: true,
              inline: true,
              toDOM: ({}) => ['span', {class: 'log_operator'}, '']
            },
            'l_brace': {
              atom: true,
              inline: true,
              toDOM: () => ['span', {class: 'l_brace'}, '(']
            },
            'r_brace': {
              atom: true,
              inline: true,
              toDOM: () => ['span', {class: 'r_brace'}, ')']
            },
            'entity': {
              atom: true,
              inline: true,
              toDOM: () => ['span', {class: 'entity'}, 0]
            },
            'operator': {
              atom: true,
              inline: true,
              toDOM: () => ['span', {class: 'operator'}, 0]
            },
            'value': {
              content: 'text*',
              inline: true,
              toDOM: () => ['span', {class: 'value'}, 0]
            },
            'text': {}
          }
        }),
        plugins: [
          history(),
          keymap({
            ...baseKeymap,
            'Mod-z': undo,
            'Mod-y': redo,
          }),
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
