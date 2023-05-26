import {useEffect, useRef} from "react"
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {keymap} from "prosemirror-keymap"
import {undo, redo, history} from "prosemirror-history"
import {MarkSpec, Schema} from "prosemirror-model"
import {baseKeymap} from "prosemirror-commands"
import {Tokens} from "../../types/editor"

import styles from './index.css'
import {colorize} from "../../lib/colorize"
import 'prosemirror-view/style/prosemirror.css'

const initialState = {
  "doc": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "(Фамилия = Жмыщенко | Отчество = Альбертович) & Имя = Валерий",
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
    const marks = Object.values(Tokens).reduce((acc, token) => ({
      ...acc,
      [token]: {
        toDOM: () => ['span', {class: styles[token]}],
      }
    }), {} as MarkSpec)

    const schema = new Schema({
      marks,
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
      attributes: {
        class: styles.doc
      },
      state: EditorState.fromJSON({
        schema,
        plugins,
      }, initialState),
      dispatchTransaction(t) {
        view.updateState(view.state.apply(t.docChanged ? colorize(t, schema) : t))
      }
    })

    view.dispatch(colorize(view.state.tr, schema))

    editorRef.current = view

    return () => {
      editorRef.current?.destroy()
    }
  }, [])



  return <div ref={ref} />
}
