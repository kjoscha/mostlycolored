import 'node_modules/react-dropzone-component/styles/filepicker.css';
import 'node_modules/dropzone/dist/min/dropzone.min.css';
import DropzoneComponent from 'react-dropzone-component';
import React from 'react';
import Gallery from './Gallery.js';
import GalleryForm from './GalleryForm.js'
import GalleryLinkContainer from './GalleryLinkContainer.js';

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      galleries: window.galleries, // first element [0] is name/folder, second [1] contains image paths
      activeGallery: null,
      uploadFolder: null,
      uploading: false,
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

  addItems() {
    // set upload folder to current gallery if this drop starts a new queue.
    // otherwise keep the folder which was set at queue start
    if (!this.state.uploading) {
      this.setState({ uploadFolder:
        this.state.activeGallery ?
          this.state.activeGallery[3] :
          'New_' + Math.random().toString(36).substring(7)
      });
    };
    this.setState({ uploading: true });
  }

  finishUpload() {
    this.setState({ uploading: false });
    // hack to get password without too much cross-component bindings
    const password = jQuery('input[name=password]').val();
    // timeout to avoid empty thumbnail for latest uploaded image
    const thisComponent = this;
    setTimeout(function() {
      thisComponent.getGalleries(password, true)
    }, 1000);
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
    let dropzoneComponentConfig = {
      iconFiletypes: ['.jpg', '.png', '.gif'],
      showFiletypeIcon: true,
      postUrl: '/save_image',
    };

    let djsConfig = {
      params: {
        folder: this.state.uploadFolder,
      },
      thumbnailHeight: '80',
      thumbnailWidth: '80',
    };

    let dropzonEventHandlers = {
      addedfile: () => this.addItems(),
      queuecomplete: () => this.finishUpload(),
      success: () => this.finishUpload(),
    }

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
          <DropzoneComponent
            config={dropzoneComponentConfig}
            djsConfig={djsConfig}
            eventHandlers={dropzonEventHandlers}>
            <div className='dz-message'>Drop some files here or click to select some. Files will be saved in the current gallery, thus feel free to create a new one with the input field on the top....</div>
          </DropzoneComponent>
        </div>

        <div id='disk-space'>{'Still ' + window.diskSpace + ' gigabytes free space.'}</div>
        <div id='hdndlt' onClick={this.deleteGallery}></div>
      </div>
    )
  }
}

export default App;
