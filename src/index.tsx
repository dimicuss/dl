import {createRoot} from 'react-dom/client'
import {Editor} from './shared/ui/editor'

const App = () => {
  return <Editor />
}


const enterPoint = document.createElement('div')
const root = createRoot(enterPoint)

document.body.appendChild(enterPoint)
root.render(<App />)





