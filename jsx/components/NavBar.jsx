import React from 'react'
import { Link } from 'react-router'

export default class NavBar extends React.Component {
  render () {
    console.log('RENDERING')
    return (
      <nav>
        <ul>
          <li>
            <Link activeClassName="active" to="/browse/">Browse texts</Link>
            <Link activeClassName="active" to="/attachments/">Browse attachments</Link>
            <Link activeClassName="active" to="/stats/">Stats</Link>
          </li>
        </ul>
      </nav>
    )
  }
}
