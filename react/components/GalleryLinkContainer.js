import React from 'react';
import GalleryLink from './GalleryLink.js'

export default class GalleryLinkContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemsToShow: 20
    }
  }

  linkColor(index) {
    return window.randomColors[index];
  }

  handleClick(gallery) {
    this.props.activateGallery(gallery);
  }

  loadMore() {
    this.setState({
      itemsToShow: this.state.itemsToShow += 20
    })
  }

  render() {
    const galleryLinks = this.props.galleries.slice(0, this.state.itemsToShow).map((gallery, index) =>
      <GalleryLink
        key={gallery[0]}
        gallery={gallery}
        onClick={this.handleClick.bind(this, gallery)}
        active={(this.props.activeGallery !== null) && (gallery[0] == this.props.activeGallery[0])}
        color={this.linkColor(index)}
      />
    );

    return (
      <div>
        {galleryLinks}
        {this.props.galleries.length > this.state.itemsToShow ? (
          <div className='show-more' onClick={this.loadMore.bind(this)}>show more...</div>
        ) : null}
      </div>
    )
  }
}
