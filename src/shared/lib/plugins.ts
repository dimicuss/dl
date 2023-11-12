import {baseKeymap} from "prosemirror-commands"
import {history, undo, redo} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import {dlPlugin} from "shared/lib/dlPlugin"

export const plugins = [
  history(),
  keymap({
    ...baseKeymap,
    'Mod-z': undo,
    'Mod-y': redo,
  }),
  dlPlugin
]
