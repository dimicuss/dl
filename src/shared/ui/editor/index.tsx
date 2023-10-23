import {useEffect, useRef, useState} from "react"
import {EditorState, Transaction, Selection} from "prosemirror-state"
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
import {getTreeTokenMap} from "@shared/lib/getTreeTokenMap"
import {getAutoComplete} from "@shared/lib/getAutoComplete"
import {AutoCompSelection} from "@shared/ui/autocomp-selection"
import {AutoComp} from "@shared/types/autocomp"

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
  const [selection, setSelection] = useState<Selection | undefined>()
  const [autoComp, setAutoComp] = useState<AutoComp | undefined>()
  const [tokenTree, setTokenTree] = useState<Map<number, ExpressionObject[]>[]>([])
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const windowSelection = window.getSelection()
    if (windowSelection && selection && windowSelection.type === 'Caret') {
      const completions = tokenTree.map((map) => getAutoComplete(map, selection)).find(Boolean)
      const {x, y} = windowSelection.getRangeAt(0).getBoundingClientRect()

      if (x > 0 && y > 0 && completions && completions.length > 0) {
        setAutoComp({
          x,
          y,
          completions,
        })
      } else {
        setAutoComp(undefined)
      }
    }
  }, [selection, tokenTree])

  useEffect(() => {
    function handleCurrentTransaction(t: Transaction) {
      const tokens = getTokens(getCharPositions(t.doc))
      const tree = getSyntaxTree(tokens)

      const colorizedState = colorize(t.removeMark(0, t.doc.content.size), schema, tree)
      const treeTokenMap = tree.map(getTreeTokenMap)

      return {
        tree,
        colorizedState,
        treeTokenMap
      }
    }

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
          const {colorizedState, tree, treeTokenMap} = handleCurrentTransaction(t)
          setTree(tree)
          setTokenTree(treeTokenMap)
          view.updateState(view.state.apply(colorizedState))
        } else {
          view.updateState(view.state.apply(t))
        }

        setSelection(t.selection)
      }
    })

    const {colorizedState, tree, treeTokenMap} = handleCurrentTransaction(view.state.tr)
    view.dispatch(colorizedState)
    setTree(tree)
    setTokenTree(treeTokenMap)

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
