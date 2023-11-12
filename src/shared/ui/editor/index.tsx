import {useCallback, useEffect, useRef, useState} from "react"
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Mark, MarkSpec, Schema} from "prosemirror-model"
import {Atom, Expression} from "../../types/editor"
import ProseMirrorStyles from 'prosemirror-view/style/prosemirror.css'
import {Tree} from "../tree"
import {styled} from "styled-components"
import {colorStyles} from "shared/constants"
import {plugins} from "shared/lib/plugins"
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
            "text": "Возраст>=\"a\"&&(Отчество<=\"b\"||((Фамилия != \"c\") && Имя = \"d\")) ||",
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Фамилия > \"d\" ||",
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Фамилия >= \"f\" && Имя = \"g\" && Отчество < \"h\"",

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
  const ref = useRef<HTMLDivElement | null>(null)
  const [view, setView] = useState<EditorView | undefined>()


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
      })

      view.updateState(view.state.apply(view.state.tr))

      setView(view)

      return () => {
        view.destroy()
      }
    }

    return () => {}
  }, [])

  return (
    <>
      <Container>
        <div ref={ref} />
      </Container>
      {view && (
        <>
          <Tree view={view} />
          <AutoCompSelection view={view} />
          <Error />
        </>
      )}
    </>
  )
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
