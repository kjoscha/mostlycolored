import React from 'react';
import Image from './Image.js'

export default class Gallery extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      activeImageIndex: null,
    }
    this.activateImage = this.activateImage.bind(this);
    this.download = this.download.bind(this);
  }

  // to reset state after images have updated
  // this is a built-in function of React
  componentWillReceiveProps() {
    this.setState({ activeImageIndex: null })
  }

  activateImage(index) {
    const newIndex = this.state.activeImageIndex == index ? null : index
    this.setState({ activeImageIndex: newIndex })
  }

  download() {
    var thisComponent = this;
    jQuery('.download-link').text('Creating the zip file. Please wait...');
    jQuery.ajax({
      url: 'zip',
      data: { folder: thisComponent.props.gallery[3] },
      method: 'GET',
      success: function(data) {
        jQuery('.download-link').text('Download all images as zip >>>');
        window.location = data;
      },
      error: function(data) {
        jQuery('.download-link').text('Download all images as zip >>>');
        console.log('Error!');
      }
    });
  }

  render() {
    const images = this.props.gallery[1].map((image, index) =>
      <Image
        key={index} url={this.state.activeImageIndex == index ? image[0] : image[1]}
        index={index}
        active={index == this.state.activeImageIndex}
        onClick={this.activateImage}
      />
    );

    const downloadLink = images.length > 0 ?
      <a className='download-link' onClick={this.download}>Download all images as zip >>></a> : null;

    const metaInfo = 'Latest update on ' +
      this.props.gallery[2].substring(0, 10) + ' | '
      + this.props.gallery[1].length + ' images';

    return(
      <div>
        <div className='gallery'>
          <div className='edited-at'>{metaInfo}</div>
          {images}
        </div>
          {downloadLink}
      </div>
    )
  }
}
