import request from 'superagent'
import React from 'react'

import Texts from './Texts.jsx'

export default class SearchResults extends React.Component {
  constructor () {
    super()
    this.state = {
      results: []
    }
    this.currentRequest = null
  }

  splitQuery (query) {
    return query.split(/\s+/).filter((s) => s !== '')
  }

  getResults (query, page) {
    var me = this
    if (this.currentRequest !== null) {
      console.log('ABORTING REQUEST')
      this.currentRequest.abort()
    }

    var req = request
      .get('/api/search/')
      .query({
        'page': page,
        'q': query,
        'handles': JSON.stringify(me.context.participants.handles)
      })
      .set('Accept', 'text/json')
      .end(function (err, data) {
        console.log('DATA:')
        console.log(data)
        console.log('ERR:')
        console.log(err)
        me.setState({results: data.body})
        me.currentRequest = null
      })

    this.currentRequest = req
  }

  componentDidMount () {
    this.getResults(this.props.query, this.props.page)
  }

  componentWillReceiveProps (newProps) {
    if (this.props.page !== newProps.page || this.props.query !== newProps.query) {
      this.getResults(newProps.query, newProps.page)
    }
  }

  render () {
    var transform = (b) => this._boldMatchingStrings(b, this.splitQuery(this.props.query))
    return (
      <Texts
        texts={this.state.results}
        page={this.props.page}
        transformTextBody={transform}
      />
    )
  }

  _boldMatchingStrings (input, queryStrings) {
    // Map from character index to boolean saying if char should be bolded
    var boldChar = []
    var i
    for (i = 0; i < queryStrings.length; i++) {
      var indices = this._allIndicesOf(input.toLowerCase(), queryStrings[i].toLowerCase())
      for (var j = 0; j < indices.length; j++) {
        for (var k = 0; k < queryStrings[i].length; k++) {
          boldChar[indices[j] + k] = true
        }
      }
    }

    // Fill in the rest of the map
    for (i = 0; i < input.length; i++) {
      if (boldChar[i] === undefined) {
        boldChar[i] = false
      }
    }

    // Actually bold the chars that should be bolded
    var prevState = null
    var currentString = ''
    var elements = []
    for (i = 0; i < input.length; i++) {
      var currState = boldChar[i] ? 'bold' : 'normal'

      if (prevState === null) {
        prevState = currState
      }

      if (currState === prevState) {
        currentString += input[i]
      }

      else if (prevState === 'normal') {
        elements.push(currentString)
        currentString = input[i]
      }

      else if (prevState === 'bold') {
        elements.push(<strong>{currentString}</strong>)
        currentString = input[i]
      }

      prevState = currState
    }

    if (currentString !== '') {
      if (prevState === 'bold') {
        elements.push(<strong>{currentString}</strong>)
      }
      else {
        elements.push(currentString)
      }
    }

    return elements
  }

  _allIndicesOf (s, q) {
    var indices = []
    for (var pos = s.indexOf(q); pos !== -1; pos = s.indexOf(q, pos + 1)) {
      indices.push(pos)
    }
    return indices
  }
}

SearchResults.propTypes = {
  page: React.PropTypes.number,
  query: React.PropTypes.string
}

SearchResults.defaultProps = {
  page: 1
}

SearchResults.contextTypes = {
  participants: React.PropTypes.object
}
