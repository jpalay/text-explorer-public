import ReactDom from 'react-dom'

import AppRouter from './components/AppRouter.jsx'

const app = document.getElementById('content')
ReactDom.render(<AppRouter/>, app)
