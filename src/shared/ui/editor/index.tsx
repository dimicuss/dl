import {useEffect, useRef, useState} from "react"
import {EditorState, Transaction} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {keymap} from "prosemirror-keymap"
import {undo, redo, history} from "prosemirror-history"
import {MarkSpec, Schema} from "prosemirror-model"
import {baseKeymap} from "prosemirror-commands"
import {Atom, Expression} from "../../types/editor"

import styles from './index.css'
import {getTokens} from "@shared/lib/getTokens"
import {getCharPositions} from "@shared/lib/getChars"
import {colorize} from "@shared/lib/colorize"
import {getSyntaxTree} from "@shared/lib/getSyntaxTree"
import {serializeExpression} from "@shared/lib/serializeExpression"
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
            "text": "Возраст >= a & (Отчество <= b | ((Фамилия != c) & Имя = d)) |",
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Фамилия > d |",
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Фамилия >= f & Имя = g & Отчество < h",

          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Возраст < 27 | Имя = i",
          }
        ]
      },
    ]
  },
  "selection": {
    "type": "text",
    "anchor": 1,
    "head": 1
  }
}


export const Editor = () => {
  const [serializedTree, setSerializedTree] = useState('')
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleCurrentTransaction(t: Transaction) {
      const tokens = getTokens(getCharPositions(t.doc))
      const tree = getSyntaxTree(tokens)
      const serializedTree = serializeExpression(tree)
      const colorizedState = colorize(t.removeMark(0, t.doc.content.size), schema, tree)

      return {
        colorizedState,
        serializedTree
      }
    }

    const marks = [...Object.values(Atom), ...Object.values(Expression)].reduce((acc, type) => ({
      ...acc,
      [type]: {
        toDOM: () => ['span', {class: styles[type]}],
      }
    }), {} as MarkSpec)

    const schema = new Schema({
      marks,
      nodes: {
        doc: {
          content: 'paragraph+',
          toDom: () => ['div', 0]
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
        if (t.docChanged) {
          const {colorizedState, serializedTree} = handleCurrentTransaction(t)
          view.updateState(view.state.apply(colorizedState))
          setSerializedTree(serializedTree)
        } else {
          view.updateState(view.state.apply(t))
        }
      }
    })

    const {colorizedState, serializedTree} = handleCurrentTransaction(view.state.tr)

    view.dispatch(colorizedState)
    setSerializedTree(serializedTree)

    return () => {
      view.destroy()
    }
  }, [])



  return (
    <div className={styles.container}>
      <div className={styles.editor}>
        <div ref={ref} />
      </div>
      <pre className={styles.serialization}>{serializedTree}</pre>
    </div>
  )
}
