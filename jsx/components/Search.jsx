import React from 'react'

export default class Search extends React.Component {
  constructor () {
    super()

    this.state = {
      query: ''
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
  }

  componentDidMount () {
    this.setState({query: this.props.initialQuery})
  }

  handleChange (event) {
    this.setState({query: event.target.value})
  }

  handleKeydown (event) {
    if (event.key === 'Enter') {
      this.doSearch()
    }
  }

  handleClick (event) {
    this.doSearch()
  }

  doSearch (event) {
    this.context.router.push(this.props.urlFormatter(this.state.query))
  }

  render () {
    var me = this
    return (
      <div className="search-bar">
        <input
          type="text"
          class="search-input"
          value={me.state.query}
          onChange={me.handleChange}
          onKeyDown={me.handleKeydown}/>
        <div class="search-btn" onClick={me.handleClick}>Search</div>
      </div>
    )
  }
};

Search.propTypes = {
  urlFormatter: React.PropTypes.func
}

Search.defaultProps = {
  urlFormatter: (q) => '/search/' + q + '/'
}

Search.contextTypes = {
  router: React.PropTypes.object.isRequired
}
