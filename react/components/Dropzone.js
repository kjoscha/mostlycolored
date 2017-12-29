import React from 'react';
import 'node_modules/react-dropzone-component/styles/filepicker.css';
import 'node_modules/dropzone/dist/min/dropzone.min.css';
import DropzoneComponent from 'react-dropzone-component';

export default class Dropzone extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadFolder: null,
      uploading: false,
    };
  }

  addItems() {
    // set upload folder to current gallery if this drop starts a new queue.
    // otherwise keep the folder which was set at queue start
    if (!this.state.uploading) {
      this.setState({ uploadFolder:
        this.props.activeGallery ?
          this.props.activeGallery[3] :
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
    var thisComponent = this;
    setTimeout(function() {
      thisComponent.props.getGalleries({
        password: password,
        changeToLatest: true,
      })
    }, 1000);
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
      <DropzoneComponent
        config={dropzoneComponentConfig}
        djsConfig={djsConfig}
        eventHandlers={dropzonEventHandlers}>
        <div className='dz-message'>Drop some files here or click to select some. Files will be saved in the current gallery, thus feel free to create a new one with the input field on the top....</div>
      </DropzoneComponent>
    )
  }
}
