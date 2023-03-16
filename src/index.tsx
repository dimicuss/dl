import {createRoot} from 'react-dom/client'
import {Editor} from './shared/ui/editor'

import './shared/lib/getTokens'

const App = () => {
  return <Editor />
}


const enterPoint = document.createElement('div')
const root = createRoot(enterPoint)

document.body.appendChild(enterPoint)
root.render(<App />)





