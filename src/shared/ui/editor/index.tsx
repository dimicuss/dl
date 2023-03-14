import {useEffect, useRef} from "react"
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {keymap} from "prosemirror-keymap"
import {undo, redo, history} from "prosemirror-history"
import {Schema} from "prosemirror-model"
import {baseKeymap} from "prosemirror-commands"
import styles from './index.css'

const initialState = {
  "doc": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Entity",
            "marks": [
              {
                "type": "entity"
              }
            ]
          },
          {
            "type": "text",
            "text": "&",
            "marks": [
              {
                "type": "operator"
              }
            ]
          },
          {
            "type": "text",
            "text": 'Value',
            "marks": [
              {
                "type": "value"
              }
            ]
          },
          {
            "type": "text",
            "text": ' Prompt',
          },
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Prompt"
          }
        ]
      }
    ]
  },
  "selection": {
    "type": "text",
    "anchor": 1,
    "head": 1
  }
}


export const Editor = () => {
  const ref = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<EditorView | null>(null)


  useEffect(() => {
    const schema = new Schema({
      nodes: {
        'doc': {
          content: 'paragraph+'
        },
        'paragraph': {
          content: 'text*',
          marks: '_',
          toDOM: () => ['p', {class: styles.paragraph}, 0],
        },
        'text': {inline: true}
      },
      marks: {
        'log_operator': {
          toDOM: ({}) => ['span', {class: styles.log_operator}, 0],
        },
        'l_brace': {
          toDOM: () => ['span', {class: styles.l_brace}, 0],
        },
        'r_brace': {
          toDOM: () => ['span', {class: styles.r_brace}, 0],
        },
        'entity': {
          toDOM: () => ['span', {class: styles.entity}, 0],
        },
        'operator': {
          toDOM: () => ['span', {class: styles.operator}, 0],
        },
        'value': {
          toDOM: () => ['span', {class: styles.value}, 0],
        },
      }
    })

    const view = new EditorView(ref.current, {
      state: EditorState.fromJSON({
        schema: schema,
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
        console.log(t)
        const newState = view.state.apply(t)
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
