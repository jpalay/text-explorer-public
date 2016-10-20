import React from 'react'
import request from 'superagent'

export default class TextMessage extends React.Component {
  constructor () {
    super()

    this.state = {
      currentRequest: null
    }

    this.goToTextMessage = this.goToTextMessage.bind(this)
  }

  goToTextMessage () {
    var me = this
    if (this.state.currentRequest !== null) {
      console.log('ABORTING REQUEST')
      this.state.currentRequest.abort()
    }

    var req = request
      .get('/api/page_number/')
      .query({
        handles: JSON.stringify(me.context.participants.handles),
        message_id: this.props.rowid
      })
      .set('Accept', 'text/json')
      .end(function (err, data) {
        if (data === undefined) {
          console.log('Error fetching page number: ' + err)
          me.setState({currentRequest: null})
        }
        me.context.router.push('/browse/' + data.body.page + '/' + me.props.rowid + '/')
      })

    this.setState({currentRequest: req})
  }

  _messageBody () {
    var textBody = []
    var body = this.props.body
    var objectReplacementCharacter = String.fromCodePoint(65532)
    if (body !== null && body.trim() !== '' && body.trim() !== objectReplacementCharacter) {
      textBody.push(<p key={this.props.row_id + '_0'} className="text-text">{this.props.transformTextBody(body)}</p>)
    }

    if (this.props.attachment !== null) {
      var src = '/static/' + this.props.attachment
      var isImg = false
      var imgExtensions = ['.svg', '.png', '.jpg', 'jpeg', '.gif']
      for (var i = 0; i < imgExtensions.length; i++) {
        if (this._endsWith(src.toLowerCase(), imgExtensions[i])) {
          isImg = true
        }
      }
      if (isImg) {
        textBody.push(<img key={this.props.row_id + '_1'} className="text-attachment" src={src} alt={this.props.attachment}/>)
      }
      else {
        textBody.push(<a key={this.props.row_id + '_1'} className="text-attachment" href={src}/>)
      }
    }

    return textBody
  }

  _endsWith (s, suffix) {
    return s.indexOf(suffix, s.length - suffix.length) !== -1
  }

  render () {
    var sender = this.props.sent === 'sent' ? this.context.participants.sender : this.context.participants.receiver
    var highlightClass = this.props.highlighted ? ' highlighted' : ''

    var date = ''
    if (this.props.showDate) {
      date = (<div className="text-date">{this.props.dateStr}</div>)
    }

    return (
      <div className="text-message-wrapper">
        {date}
        <div className={'text-message cf' + highlightClass}>
          <div className="text-image">
            <img src={'/static/images/participants/' + sender + '.jpg'} alt={sender}/>
          </div>
          <div className="text-data">
            <div class="text-metadata">
              <span class="text-sender">{sender}</span>
              <span class="text-time">{this.props.timeStr}</span>
              <span class="text-link" onClick={this.goToTextMessage}>Link to text</span>
            </div>
            <div className="text-body">
              {this._messageBody()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

TextMessage.propTypes = {
  transformTextBody: React.PropTypes.func,
  rowid: React.PropTypes.number,
  timeStr: React.PropTypes.string,
  dateStr: React.PropTypes.string,
  timestamp: React.PropTypes.number,
  sent: React.PropTypes.string,
  body: React.PropTypes.string,
  highlighted: React.PropTypes.bool,
  attachment: React.PropTypes.string
}

TextMessage.defaultProps = {
  transformTextBody: (b) => b
}

TextMessage.contextTypes = {
  participants: React.PropTypes.object.isRequired,
  router: React.PropTypes.object.isRequired
}
