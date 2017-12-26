import React from 'react';

export default class Image extends React.Component {
  constructor(props){
    super(props)
  }

  handleClick(url) {
    this.props.onClick(url)
  }

  render() {
    return(
      <img
        src={this.props.url}
        className={this.props.active ? 'active' : ''}
        onClick={this.handleClick.bind(this, this.props.index)}
      />
    )
  }
}
