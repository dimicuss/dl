import {createRoot} from 'react-dom/client'
import {App} from './shared/ui/app'

const appRoot = document.createElement('div')
appRoot.setAttribute('id', 'app-root')
document.body.appendChild(appRoot)

const root = createRoot(appRoot)

root.render(<App />)
