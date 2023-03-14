import {useEffect, useRef} from "react"
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {keymap} from "prosemirror-keymap"
import {undo, redo, history} from "prosemirror-history"
import {Schema} from "prosemirror-model"
import {baseKeymap} from "prosemirror-commands"
import styles from './index.css'

// Валидация и автодополнение
// При заполнени построчно считывать текст (каждая строка - отдельное выражение) и парсить по синтаксическому дереву,
// далее по полученным ренджам выделять соотвествия нужными тегами + предлагать автодополнение

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
            "text": "Prompt",
            "marks": [
              {"type": "value"}
            ]
          },
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
        doc: {
          content: 'paragraph+',
          toDom: () => ['div', {class: styles.doc}, 0]
        },
        paragraph: {
          content: 'text*',
          marks: '_',
          toDOM: () => ['p', {class: styles.paragraph}, 0],
        },
        text: {}
      },
      marks: {
        brace: {
          toDOM: () => ['span', {class: styles.brace}],
        },
        entity: {
          toDOM: () => ['span', {class: styles.entity}],
        },
        operator: {
          toDOM: () => ['span', {class: styles.operator}],
        },
        value: {
          toDOM: () => ['span', {class: styles.value}],
        },
      }
    })

    const plugins = [
      history(),
      keymap({
        ...baseKeymap,
        'Mod-z': undo,
        'Mod-y': redo,
      }),
    ]

    const view = new EditorView(ref.current, {
      state: EditorState.fromJSON({
        schema,
        plugins,
      }, initialState),
      dispatchTransaction(t) {
        const {content} = t.doc
        const {size} = content

        const newState = view.state.apply(
          t
            .removeMark(0, size)
            .addMark(0, size, schema.marks.entity.create())
        )
        view.updateState(newState)
      }
    })

    editorRef.current = view

    return () => {
      editorRef.current?.destroy()
    }
  }, [])



  return <div ref={ref} />
}
