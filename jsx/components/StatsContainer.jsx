import React from 'react'

import MostCommonTable from './MostCommonTable.jsx'
import NgramsContainer from './NgramsContainer.jsx'
import NavBar from './NavBar.jsx'

export default class StatsContainer extends React.Component {
  render () {
    return (
      <div>
        <NavBar/>
        <div id="stats">
          <div className="ngrams-container">
            <NgramsContainer query={this.props.params.query}/>
          </div>
          <div className="stat-tables cf">
            <div className="table-container">
              <MostCommonTable item="Emoji" title="Most Common Emojis" api_url="/api/common-emojis/"/>
            </div>
            <div className="table-container">
              <MostCommonTable item="Word" title="Most Common Words" api_url="/api/common-words/"/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

