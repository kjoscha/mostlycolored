import React from 'react';

export default class GalleryLink extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick(gallery) {
    this.props.onClick(gallery)
  }

  render() {
    if (this.props.gallery[1] == 'locked') {
      return <span className={'gallery-link locked'}>
        {this.props.gallery[0]}
      </span>
    } else {
      return <span
        style={{color: this.props.color, border: this.props.active ? ('1px solid ' + this.props.color) : '1px solid black'}}
        className={'gallery-link ' + (this.props.active ? 'active' : '')}
        onClick={this.handleClick.bind(this, this.props.gallery)}>
        {this.props.gallery[0]}
      </span>
    };
  }
}
