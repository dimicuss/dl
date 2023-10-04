import {createRoot} from 'react-dom/client'
import {Editor} from './shared/ui/editor'


const enterPoint = document.body
const root = createRoot(enterPoint)
root.render(<Editor />)





