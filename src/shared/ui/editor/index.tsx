import {useEffect, useRef} from "react"
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {keymap} from "prosemirror-keymap"
import {undo, redo, history} from "prosemirror-history"
import {Schema} from "prosemirror-model"
import {baseKeymap} from "prosemirror-commands"
import styles from './index.css'
import {getChars} from "../../lib/getChars"

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
            "text": "(Фамилия = Жмыщенко || Отчество = Альбертович) И Имя = Валерий",
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Prompt",
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
        const newState = view.state.apply(t)
        view.updateState(newState)
        console.log(
          getChars(t.doc)
        )
      }
    })

    editorRef.current = view

    return () => {
      editorRef.current?.destroy()
    }
  }, [])



  return <div ref={ref} />
}
