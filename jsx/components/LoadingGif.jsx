import React from 'react'

export default class LoadingGif extends React.Component {
  render () {
    return (
      <div class="loading">
        <img src="/static/images/loading.svg" alt="Loading" />
      </div>
    )
  }
}
