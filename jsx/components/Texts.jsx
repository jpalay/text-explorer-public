import React from 'react'
import ReactDOM from 'react-dom'

import LoadingGif from './LoadingGif.jsx'
import TextMessage from './TextMessage.jsx'

export default class Texts extends React.Component {
  ensureHighlightedVisible () {
    var highlightedComponent = this.refs.highlighted
    if (highlightedComponent) {
      var domNode = ReactDOM.findDOMNode(highlightedComponent)
      domNode.scrollIntoView()
    }
  }

  componentDidMount () {
    this.ensureHighlightedVisible()
  }

  componentDidUpdate () {
    this.ensureHighlightedVisible()
  }

  prepareTexts () {
    var prevDateStr = null
    for (var i = 0; i < this.props.texts.length; i++) {
      var t = this.props.texts[i]
      t.showDate = (t.dateStr !== prevDateStr)
      prevDateStr = t.dateStr
    }
  }

  render () {
    this.prepareTexts()
    if (this.props.texts.length !== 0) {
      var me = this
      return (
        <ul id="texts">
          {me.props.texts.map((t) => me.renderItem(me, t))}
        </ul>
      )
    }

    else {
      return (<LoadingGif />)
    }
  }

  renderItem (me, t) {
    var highlighted = (me.props.highlighted === t.rowid)
    var props = {
      rowid: t.rowid,
      timeStr: t.timeStr,
      dateStr: t.dateStr,
      timestamp: t.timestamp,
      sent: t.sent,
      body: t.body,
      attachment: t.attachment,
      showDate: t.showDate,
      transformTextBody: me.props.transformTextBody,
      highlighted: highlighted
    }

    if (highlighted) {
      props.ref = 'highlighted'
    }

    return (
      <li key={t.rowid}>
        <TextMessage {...props}/>
      </li>
    )
  }
}

Texts.propTypes = {
  texts: React.PropTypes.array,
  highlighted: React.PropTypes.number,
  page: React.PropTypes.number,
  transformTextBody: React.PropTypes.func
}

Texts.defaultProps = {
  page: 1,
  transformTextBody: (b) => b
}
