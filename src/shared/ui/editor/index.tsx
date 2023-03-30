import {useEffect, useRef} from "react"
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {keymap} from "prosemirror-keymap"
import {undo, redo, history} from "prosemirror-history"
import {Schema} from "prosemirror-model"
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
        [Tokens.LBrace]: {
          toDOM: () => ['span', {class: styles[Tokens.LBrace]}],
        },
        [Tokens.RBrace]: {
          toDOM: () => ['span', {class: styles[Tokens.RBrace]}],
        },
        [Tokens.Keyword]: {
          toDOM: () => ['span', {class: styles[Tokens.Keyword]}],
        },
        [Tokens.LineBreak]: {
          toDOM: () => ['span', {class: styles[Tokens.LineBreak]}],
        },
        [Tokens.Eq]: {
          toDOM: () => ['span', {class: styles[Tokens.Eq]}],
        },
        [Tokens.NotEq]: {
          toDOM: () => ['span', {class: styles[Tokens.NotEq]}],
        },
        [Tokens.MoreEq]: {
          toDOM: () => ['span', {class: styles[Tokens.MoreEq]}],
        },
        [Tokens.LessEq]: {
          toDOM: () => ['span', {class: styles[Tokens.LessEq]}],
        },
        [Tokens.And]: {
          toDOM: () => ['span', {class: styles[Tokens.And]}],
        },
        [Tokens.Or]: {
          toDOM: () => ['span', {class: styles[Tokens.Or]}],
        },
        [Tokens.WhiteSpace]: {
          toDOM: () => ['span', {class: styles[Tokens.WhiteSpace]}],
        },
        [Tokens.Identifier]: {
          toDOM: () => ['span', {class: styles[Tokens.Identifier]}],
        },
        [Tokens.Number]: {
          toDOM: () => ['span', {class: styles[Tokens.Number]}],
        },
        [Tokens.Invalid]: {
          toDOM: () => ['span', {class: styles[Tokens.Invalid]}],
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
