import React from 'react'
import {Link} from 'react-router'

export default class Paginator extends React.Component {
  render () {
    var me = this
    var prevBtn = (
      <Link to={me.props.urlFormat(me.props.page - 1)}>
        <span className="btn prev">&lt; prev</span>
      </Link>
    )
    var conditionalPrevBtn = this.props.page === 1 ? '' : prevBtn
    return (
      <div className="paginator">
        {conditionalPrevBtn}
        <span className="page-number">Page {me.props.page}</span>
        <Link to={me.props.urlFormat(me.props.page + 1)}>
          <span className="btn next">next &gt;</span>
        </Link>
      </div>
    )
  }
};

Paginator.propTypes = {
  page: React.PropTypes.number.isRequired,
  urlFormat: React.PropTypes.func.isRequired
}
