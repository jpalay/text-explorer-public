import request from 'superagent'
import React from 'react'

import LoadingGif from './LoadingGif.jsx'

export default class MostCommonTable extends React.Component {
  constructor () {
    super()

    this.state = {
      total: 0,
      mostFrequent: []
    }

    this.request = null
  }

  loadData () {
    this.setState({
      total: 0,
      mostFrequent: []
    })

    if (this.request !== null) {
      this.request.abort()
    }

    var me = this
    var req = request
      .get(this.props.api_url)
      .query({
        'handles': JSON.stringify(this.context.participants.handles)
      })
      .set('Accept', 'text/json')
      .end(function (err, data) {
        if (data === undefined) {
          console.error('ERROR UNDEFINED DATA: ')
          console.error(err)
          return
        }

        for (var i = 0; i < data.body.mostFrequent.length; i++) {
          data.body.mostFrequent[i].rank = i + 1
        }

        me.setState({
          total: data.body.total,
          mostFrequent: data.body.mostFrequent
        })
        me.request = null
      })

    this.request = req
  }

  componentDidMount () {
    this.loadData()
  }

  render () {
    if (this.state.mostFrequent.length !== 0) {
      return (
        <div className="most-common-table">
          <h3>{this.props.title}</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>{this.props.item}</th>
                <th>Occurrences</th>
                <th>Frequency</th>
              </tr>
            </thead>
            <tbody>
              {this.state.mostFrequent.map((x) => this.renderItem(this, x))}
              <tr>
                <td><strong>Total</strong></td>
                <td></td>
                <td>{this.state.total}</td>
                <td>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    }
    else {
      return (
        <div className="most-common-table">
          <h3>{this.props.title}</h3>
          <LoadingGif/>
        </div>
      )
    }
  }

  renderItem (me, item) {
    var frequency = (item.count * 100.0) / me.state.total

    return (
      <tr key={me.title + item.rank.toString()}>
        <td><strong>#{item.rank}</strong></td>
        <td>{item.item}</td>
        <td>{item.count}</td>
        <td>{frequency.toPrecision(3)}%</td>
      </tr>
    )
  }
}

MostCommonTable.propTypes = {
  item: React.PropTypes.string.isRequired,
  api_url: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired
}

MostCommonTable.contextTypes = {
  participants: React.PropTypes.object.isRequired
}
