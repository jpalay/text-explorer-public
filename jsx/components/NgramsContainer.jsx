import request from 'superagent'
import React from 'react'

import Search from './Search.jsx'
import LoadingGif from './LoadingGif.jsx'
import LineChart from './LineChart.jsx'

export default class NgramsContainer extends React.Component {
  constructor () {
    super()
    this.state = {
      data: [],
      request: null
    }
  }

  splitQuery (q) {
    return q.split(',').map((s) => s.replace(/^\s|\s+$/g, ''))
  }

  componentDidMount () {
    this.getData(this.props.query)
  }

  componentWillReceiveProps (newProps) {
    if (this.props.query !== newProps.query) {
      this.getData(newProps.query)
    }
  }

  getData (query) {
    var me = this
    var splitWords = query === null || query === '' ? [] : this.splitQuery(query)
    var req = request
      .get('/api/ngrams/')
      .query({
        handles: JSON.stringify(me.context.participants.handles),
        words: JSON.stringify(splitWords)
      })
      .set('Accept', 'text/json')
      .end(function (err, data) {
        if (data === undefined) {
          console.error('Error fetching data: ' + err)
          me.setState({request: null})
        }
        me.setState({
          data: data.body,
          request: null
        })
      })

    this.setState({request: req})
  }

  render () {
    if (this.state.request === null) {
      var yAxis = 'Occurrences per text'
      if (this.props.query === '' || this.props.query === null) {
        yAxis = 'Texts per day'
      }
      return (
        <div className="ngrams">
          <Search
              urlFormatter={(q) => ('/stats/' + q + (q === '' || q === null ? '' : '/'))}
              initialQuery={this.props.query}/>
          {this.state.data.length !== 0 ? <LineChart yaxis={yAxis} smoothing={14} data={this.state.data}/> : ''}
        </div>
      )
    }

    else {
      return (
        <div className="ngrams">
          <LoadingGif/>
        </div>
      )
    }
  }
}

NgramsContainer.propTypes = {
  query: React.PropTypes.string
}

NgramsContainer.defaultProps = {
  query: null
}

NgramsContainer.contextTypes = {
  participants: React.PropTypes.object.isRequired
}
