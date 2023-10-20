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
  const [tree, setTree] = useState<ExpressionObject[]>([])
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleCurrentTransaction(t: Transaction) {
      const tokens = getTokens(getCharPositions(t.doc))
      const tree = getSyntaxTree(tokens)

      const colorizedState = colorize(t.removeMark(0, t.doc.content.size), schema, tree)

      return {
        colorizedState,
        tree
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
          const {colorizedState, tree} = handleCurrentTransaction(t)
          setTree(tree)
          view.updateState(view.state.apply(colorizedState))
        } else {
          view.updateState(view.state.apply(t))
        }
      }
    })

    const {colorizedState, tree} = handleCurrentTransaction(view.state.tr)
    view.dispatch(colorizedState)
    setTree(tree)

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
    </>
  )
}

const Container = styled.div`
  ${ProseMirrorStyles}
  
  background-color: #282C34;
  
  .p {
    color: white;
  }

  .keyword {
    color: #66D9EF;
  }


  .string {
    color: #C0B863;
  } 

  .number {
    color: #AE81FF;
  }

  .eq, .not_eq, .more_eq, .less_eq, .more, .less, .braced, .and, .or {
    color: #E6256B;
  }

  .invalid {
    color: red;
    text-decoration: underline;
  }

  .doc {
    outline: none;
  }
`
