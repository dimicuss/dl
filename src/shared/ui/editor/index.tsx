import {useEffect, useRef, useState} from "react"
import {EditorState, Transaction} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {keymap} from "prosemirror-keymap"
import {undo, redo, history} from "prosemirror-history"
import {MarkSpec, Schema} from "prosemirror-model"
import {baseKeymap} from "prosemirror-commands"
import {Atom, Expression, ExpressionObject} from "../../types/editor"
import {getTokens} from "@shared/lib/getTokens"
import {getCharPositions} from "@shared/lib/getChars"
import {colorize} from "@shared/lib/colorize"
import {getSyntaxTree} from "@shared/lib/getSyntaxTree"
import ProseMirrorStyles from 'prosemirror-view/style/prosemirror.css'
import {Tree} from "../tree"
import {styled} from "styled-components"
import {colorStyles} from "@shared/constants"
import {AutoCompSelection} from "@shared/ui/autocomp-selection"
import {AutoComp} from "@shared/types/autocomp"
import {getAutoCompMap} from "@shared/lib/getAutoCompMap"

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
            "text": "Возраст < 27 | Имя =",
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
  const [tree, setTree] = useState<ExpressionObject[]>([])
  const [editorState, setEditorState] = useState<EditorState | undefined>()
  const [autoComp, setAutoComp] = useState<AutoComp | undefined>()
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const windowSelection = window.getSelection()
    if (windowSelection && editorState && windowSelection.type === 'Caret') {
      const {x, y} = windowSelection.getRangeAt(0).getBoundingClientRect()
      const completions = tree
        .map((t) => getAutoCompMap(t, editorState).get(editorState.selection.anchor))
        .find(Boolean)

      if (completions && x > 0 && y > 0) {
        setAutoComp({
          x,
          y,
          completions
        })
      } else {
        setAutoComp(undefined)
      }
    }
  }, [editorState, tree])

  useEffect(() => {
    const marks = [...Object.values(Atom), ...Object.values(Expression)].reduce((acc, type) => ({
      ...acc,
      [type]: {
        toDOM: () => ['span', {class: String(type)}],
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
          toDOM: () => ['p', {class: 'p'}, 0],
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
        class: 'doc'
      },
      state: EditorState.fromJSON({
        schema,
        plugins,
      }, initialState),
      dispatchTransaction(t) {
        if (t.docChanged) {
          const {colorizedState, tree} = handleCurrentTransaction(t, schema)
          setTree(tree)
          view.updateState(view.state.apply(colorizedState))
        } else {
          view.updateState(view.state.apply(t))
        }

        setEditorState(view.state)
      }
    })

    const {colorizedState, tree} = handleCurrentTransaction(view.state.tr, schema)
    view.dispatch(colorizedState)
    setTree(tree)
    setEditorState(view.state)

    return () => {
      view.destroy()
    }
  }, [])

  return (
    <>
      <Container>
        <div ref={ref} />
      </Container>
      <Tree tree={tree} />
      {autoComp && <AutoCompSelection object={autoComp} />}
    </>
  )
}

function handleCurrentTransaction(t: Transaction, schema: Schema) {
  const tokens = getTokens(getCharPositions(t.doc))
  const tree = getSyntaxTree(tokens)
  const colorizedState = colorize(t.removeMark(0, t.doc.content.size), schema, tree)

  return {
    tree,
    colorizedState,
  }
}

const Container = styled.div`
  ${ProseMirrorStyles}
  ${colorStyles}
  
  color: white;
  
  .invalid {
    text-decoration: underline;
  }

  .doc {
    outline: none;
  }
`
