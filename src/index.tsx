import {createRoot} from 'react-dom/client'
import {Editor} from './shared/ui/editor'


const enterPoint = document.createElement('div')
const root = createRoot(enterPoint)

document.body.appendChild(enterPoint)
root.render(<Editor />)





