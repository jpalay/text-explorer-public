import React from 'react'
import { Router, IndexRoute, Route, browserHistory } from 'react-router'

import Browse from './Browse.jsx'
import NavBar from './NavBar.jsx'
import SearchResultsContainer from './SearchResultsContainer.jsx'
import StatsContainer from './StatsContainer.jsx'
import AttachmentContainer from './AttachmentContainer.jsx'

export default class AppRouter extends React.Component {
  getChildContext () {
    return {
      'participants': {
        'sender': 'SENDER',      // TODO: change this
        'receiver': 'RECIEVER',  // TODO: change this
        'handles': ['+15551234'] // TODO: Change this
      }
    }
  }

  render () {
    return (
      <Router onUpdate={() => window.scrollTo(0, 0)} history={browserHistory}>
        <Route path='/'>
          <IndexRoute component={NavBar}/>
          <Route path='browse/' component={Browse}>
            <Route path=':page/' component={Browse}/>
            <Route path=':page/:highlighted/' component={Browse}/>
          </Route>
          <Route name='search' path='/search/:query/' component={SearchResultsContainer}/>
          <Route name='search' path='/search/:query/:page/' component={SearchResultsContainer}/>

          <Route path='attachments/' component={AttachmentContainer}>
            <Route path=':page/' component={AttachmentContainer}/>
            <Route path=':page/:highlighted/' component={AttachmentContainer}/>
          </Route>

          <Route name='stats' path='stats/' component={StatsContainer}>
            <Route name='stats' path=':query/' component={StatsContainer}/>
          </Route>
        </Route>
      </Router>
    )
  }
}

AppRouter.childContextTypes = {
  participants: React.PropTypes.object
}
