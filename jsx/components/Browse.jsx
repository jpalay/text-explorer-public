import React from 'react'
import request from 'superagent'

import Search from './Search.jsx'
import Texts from './Texts.jsx'
import Paginator from './Paginator.jsx'
import NavBar from './NavBar.jsx'

export default class Browse extends React.Component {
  constructor () {
    super()

    this.state = {
      texts: []
    }

    this.urlFormat = this.urlFormat.bind(this)
    this.currentRequest = null
  }

  urlFormat (newPage) {
    return '/browse/' + newPage + '/'
  }

  apiUrl () {
    return '/api/chat/'
  }

  getTexts (page) {
    var me = this

    this.setState({texts: []})

    if (this.currentRequest !== null) {
      this.currentRequest.abort()
    }

    var req = request
      .get(this.apiUrl())
      .query({
        'page': page,
        'handles': JSON.stringify(me.context.participants.handles)
      })
      .set('Accept', 'text/json')
      .end(function (err, data) {
        if (data === undefined) {
          console.log('ERROR: ')
          console.log(err)
          console.log('UNDEFINED DATA')
        }
        for (var i = 0; i < data.body.length; i++) {
          if (i === 0 || data.body[i].timestamp - data.body[i - 1].timestamp > 300) {
            data.body[i].show_time = true
          }
          else {
            data.body[i].show_time = false
          }
        }
        me.setState({texts: data.body})
        me.currentRequest = null
      })

    this.currentRequest = req
  }

  componentDidMount () {
    this.getTexts(this.props.params.page)
  }

  componentWillReceiveProps (newProps) {
    if (this.props.params.page !== newProps.params.page) {
      this.getTexts(newProps.params.page)
    }
  }

  render () {
    var page = 1
    if (this.props.params.page !== undefined) {
      page = parseInt(this.props.params.page)
    }

    var highlighted = null
    if (this.props.params.highlighted !== undefined) {
      highlighted = parseInt(this.props.params.highlighted)
    }

    var me = this
    return (
      <div>
        <NavBar/>
        <div id='browse'>
          <Search/>
          <Texts highlighted={highlighted} texts={this.state.texts} page={page}/>
          <Paginator page={page} urlFormat={me.urlFormat}/>
        </div>
      </div>
    )
  }
}

Browse.contextTypes = {
  participants: React.PropTypes.object
}
