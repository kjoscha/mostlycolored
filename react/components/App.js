import React from 'react';
import Dropzone from './Dropzone.js';
import Gallery from './Gallery.js';
import GalleryForm from './GalleryForm.js'
import GalleryLinkContainer from './GalleryLinkContainer.js';

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      galleries: window.galleries, // first element [0] is name/folder, second [1] contains image paths
      activeGallery: null,
    }
    this.activateGallery = this.activateGallery.bind(this);
    this.updateGalleries = this.updateGalleries.bind(this);
    this.deleteGallery = this.deleteGallery.bind(this);
    this.getGalleries = this.getGalleries.bind(this);
  }

  activateGallery(gallery) {
    this.setState({ activeGallery: gallery });
    // show password in input field
    const password = gallery[3].split('___')[1]
    jQuery('input[name=password]').val(password);
  }

  updateGalleries(galleries, changeToLatest) {
    this.setState({ galleries: galleries });
    const latestChangedGallery = galleries[0]; // last element of array (sorted on server)
    if (changeToLatest && latestChangedGallery && latestChangedGallery[1] != 'locked') {
      this.setState({ activeGallery: latestChangedGallery });
    };
  }

  getGalleries(password, changeToLatest) {
    var thisComponent = this;
    jQuery.ajax({
      url: 'get_galleries',
      data: { password: password },
      dataType: 'json',
      method: 'GET',
      success: function(data) {
        thisComponent.updateGalleries(data, changeToLatest);
      },
      error: function() {
        console.log('ERROR!');
      }
    });
  }

  deleteGallery() {
    var thisComponent = this;
    var gallery = thisComponent.state.activeGallery
    if (gallery && confirm('Are you sure you want to delete this?')) {
      jQuery.ajax({
        url: 'delete_gallery',
        data: { folder: gallery[3] },
        method: 'POST',
        success: function() {
          thisComponent.getGalleries(jQuery('input[name=password]').val(), true);
        },
        error: function() {
          console.log('ERROR!');
        }
      });
    }
  }

  render() {
    return(
      <div>
        <div className='form-container'>
          <GalleryForm
            updateGalleries={this.updateGalleries}
            getGalleries={this.getGalleries}
          />
        </div>

        <div className='gallery-link-container'>
          <GalleryLinkContainer
            activateGallery={this.activateGallery}
            galleries={this.state.galleries}
            activeGallery={this.state.activeGallery}
          />
        </div>

        <div className='gallery-container'>
          {this.state.activeGallery != null ? (
            <Gallery gallery={this.state.activeGallery} />
          ) : null}
        </div>

        <div className='dropzone-container'>
          <Dropzone
            activeGallery={this.state.activeGallery}
            getGalleries={this.getGalleries}
          />
        </div>

        <div id='disk-space'>{'Still ' + window.diskSpace + ' gigabytes free space.'}</div>
        <div id='hdndlt' onClick={this.deleteGallery}></div>
      </div>
    )
  }
}

export default App;
