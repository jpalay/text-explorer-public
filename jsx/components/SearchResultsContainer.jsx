import React from 'react'
import Search from './Search.jsx'
import SearchResults from './SearchResults.jsx'
import Paginator from './Paginator.jsx'
import NavBar from './NavBar.jsx'

export default class SearchResultsContainer extends React.Component {
  constructor () {
    super()
    this.urlFormat = this.urlFormat.bind(this)
  }

  urlFormat (newPage) {
    return '/search/' + this.props.params.query + '/' + newPage + '/'
  }

  render () {
    var page = 1
    if (this.props.params.page !== undefined) {
      page = parseInt(this.props.params.page)
    }

    var me = this
    return (
      <div>
        <NavBar/>
        <div id="search-results">
          <Search initialQuery={me.props.params.query}/>
          <SearchResults query={me.props.params.query} page={page}/>
          <Paginator page={page} urlFormat={me.urlFormat}/>
        </div>
      </div>
    )
  }
}
