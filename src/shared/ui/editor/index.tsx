import {useCallback, useEffect, useRef, useState} from "react"
import {EditorState, Transaction} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Mark, MarkSpec, Schema} from "prosemirror-model"
import {Atom, Expression, ExpressionObject} from "../../types/editor"
import {getTokens} from "shared/lib/getTokens"
import {getCharPositions} from "shared/lib/getCharPositions"
import {colorize} from "shared/lib/colorize"
import {getSyntaxTree} from "shared/lib/getSyntaxTree"
import ProseMirrorStyles from 'prosemirror-view/style/prosemirror.css'
import {Tree} from "../tree"
import {styled} from "styled-components"
import {colorStyles, plugins} from "shared/constants"
import {AutoCompSelection} from "shared/ui/autocomp-selection"
import {Error} from "../error"

const initialState = {
  "doc": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Возраст>=a&&(Отчество<=b||((Фамилия != c) && Имя = d)) ||",
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Фамилия > d ||",
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Фамилия >= f && Имя = g && Отчество < h",

          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Возраст < 27 && Имя =",
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
  const ref = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | undefined>()


  useEffect(() => {
    if (ref.current) {
      const colorMarks = [...Object.values(Atom), ...Object.values(Expression)].reduce((acc, type) => ({
        ...acc,
        [type]: {
          toDOM: () => ['span', {class: String(type)}],
        }
      }), {} as Record<string, MarkSpec>)

      const schema = new Schema({
        marks: {
          error: {
            attrs: {
              'data-error': {
                default: undefined,
              }
            },
            toDOM: (mark: Mark) => ['span', {class: 'error', ...mark.attrs}],
          },
          ...colorMarks,
        },
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

      viewRef.current = view

      return () => {
        view.destroy()
      }
    }

    return () => {}
  }, [])

  const getView = useCallback(() => {
    return viewRef.current
  }, [])

  return (
    <>
      <Container>
        <div ref={ref} />
      </Container>
      <Tree tree={tree} />
      <AutoCompSelection tree={tree} getView={getView} editorState={editorState} />
      <Error />
    </>
  )
}

function handleCurrentTransaction(t: Transaction, schema: Schema) {
  const tree = getSyntaxTree(getTokens(getCharPositions(t.doc)))
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
  
  .error {
    text-decoration: underline red;
  }

  .doc {
    outline: none;
  }
`
