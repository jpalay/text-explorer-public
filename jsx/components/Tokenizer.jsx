import React from 'react'
import fuzzy from 'fuzzy'

export default class Tokenizer extends React.Component {
  constructor () {
    super()

    this.state = {
      chosenTokens: [],
      inputValue: '',
      selectedTokenKey: null
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
    this.handleMouseEnter = this.handleMouseEnter.bind(this)
    this.handleMouseOut = this.handleMouseOut.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleInputsClick = this.handleInputsClick.bind(this)
    this.handleDeleteClick = this.handleDeleteClick.bind(this)
  }

  handleChange (event) {
    this.setState({inputValue: event.target.value})
    if (this.getToken(this.state.selectedTokenKey, this.getMatchingTokens(event.target.value)) === null) {
      this.setState({selectedTokenKey: null})
    }
  }

  handleKeydown (event) {
    var matchingTokens
    var curr
    if (event.key === 'ArrowDown') {
      matchingTokens = this.getMatchingTokens()
      if (this.state.selectedTokenKey === null) {
        this.setState({selectedTokenKey: matchingTokens[0].key})
      }
      else {
        curr = this.getTokenIndex(this.state.selectedTokenKey, matchingTokens)
        if (curr === null || curr === matchingTokens.length - 1) {
          this.setState({selectedTokenKey: matchingTokens[0].key})
        }
        else {
          this.setState({selectedTokenKey: matchingTokens[curr + 1].key})
        }
      }
    }

    else if (event.key === 'ArrowUp') {
      matchingTokens = this.getMatchingTokens()
      if (this.state.selectedTokenKey === null) {
        this.setState({selectedTokenKey: matchingTokens[matchingTokens.length - 1].key})
      }
      else {
        curr = this.getTokenIndex(this.state.selectedTokenKey, matchingTokens)
        if (curr === null || curr === 0) {
          this.setState({selectedTokenKey: matchingTokens[matchingTokens.length - 1].key})
        }
        else {
          this.setState({selectedTokenKey: matchingTokens[curr - 1].key})
        }
      }
    }

    else if (event.key === 'Enter') {
      this.addSelectedTokenToChosen()
      this.setState({
        selectedTokenKey: null,
        inputValue: ''
      })
    }

    else if (event.key === 'Escape') {
      this.setState({
        selectedTokenKey: null,
        inputValue: ''
      })
    }
  }

  handleMouseEnter (event) {
    var key = event.target.getAttribute('data-tokenkey')
    if (key !== undefined) {
      this.setState({selectedTokenKey: key})
    }
  }

  handleClick (event) {
    this.addSelectedTokenToChosen()
  }

  handleMouseOut (event) {
    this.setState({selectedTokenKey: null})
  }

  handleInputsClick (event) {
    this.refs.tokenizeInput.focus()
  }

  handleDeleteClick (event) {
    var key = event.target.getAttribute('data-tokenkey')
    var i = this.getTokenIndex(key, this.state.chosenTokens)
    var part1 = this.state.chosenTokens.slice(0, i)
    var part2 = this.state.chosenTokens.slice(i + 1, this.state.chosenTokens.length)
    var newTokens = part1.concat(part2)
    this.setState({
      chosenTokens: newTokens
    })
    this.props.onChange(newTokens)
  }

  addSelectedTokenToChosen () {
    console.log('SELECTED KEY IS ' + this.state.selectedTokenKey)
    if (this.state.selectedTokenKey !== null) {
      var i = this.getTokenIndex(this.state.selectedTokenKey, this.props.options)
      console.log('FOUND AT INDEX ' + i)
      if (this.getToken(this.state.selectedTokenKey, this.state.chosenTokens) === null) {
        var newTokens = this.state.chosenTokens.concat([this.props.options[i]])
        this.setState({
          chosenTokens: newTokens
        })
        this.props.onChange(newTokens)
      }
      this.refs.tokenizeInput.focus()
    }
  }

  getToken (key, tokens) {
    var me = this
    var matchingTokens = tokens.filter(
      function (t) { return me.state.selectedTokenKey === t.key }
    )
    if (matchingTokens.length !== 0) {
      return matchingTokens[0]
    }
    return null
  }

  getMatchingTokens (pattern = null) {
    if (pattern === null) {
      pattern = this.state.inputValue
    }

    if (pattern === '') {
      return []
    }

    var fuzzyOptions = {
      pre: '<strong>',
      post: '</strong>',
      extract: function (option) { return option.name }
    }

    var results = fuzzy.filter(pattern, this.props.options, fuzzyOptions)
    var ret = []
    for (var i = 0; i < results.length; i++) {
      var newObj = results[i].original
      newObj.matchString = results[i].string
      ret.push(newObj)
    }
    return ret
  }

  getTokenIndex (tokenKey, tokenList) {
    if (tokenKey === null) {
      return null
    }
    for (var i = 0; i < tokenList.length; i++) {
      if (tokenKey === tokenList[i].key) {
        return i
      }
    }

    return null
  }

  render () {
    var me = this
    var matchingTokens = me.getMatchingTokens()
    var ulClass = 'suggestions ' + (matchingTokens.length === 0 ? 'empty' : 'nonempty')
    return (
      <div className="tokenize-input" onMouseOut={me.handleMouseOut}>
        <ul className="inputs" onClick={me.handleInputsClick}>
          {me.state.chosenTokens.map(function (token) {
            return (
              <li className="selected-token" key={token.key}>
                <span className="token-delete"
                  onClick={me.handleDeleteClick}
                  data-tokenkey={token.key}
                  >✕</span>
                <span className="token-name">{token.name}</span>
              </li>
            )
          })}
          <li>
            <input
              onChange={me.handleChange}
              onKeyDown={me.handleKeydown}
              ref="tokenizeInput"
              type="text"
              value={me.state.inputValue}/>
          </li>
        </ul>

        <ul className={ulClass}>
          {me.getMatchingTokens().map(function (match) {
            return <li
              data-tokenkey={match.key}
              key={match.key}
              className={match.key === me.state.selectedTokenKey ? 'selected' : 'unselected'}
              dangerouslySetInnerHTML={{__html: match.matchString}}
              onMouseOver={me.handleMouseEnter}
              onClick={me.handleClick}/>
          })}
        </ul>
      </div>
    )
  }
};

Tokenizer.propTypes = {
  options: React.PropTypes.array,
  onChange: React.PropTypes.func
}

Tokenizer.defaultProps = {
  options: [],
  onChange: function (tokens) { console.log(tokens) }
}
