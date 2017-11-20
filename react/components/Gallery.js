import 'node_modules/react-dropzone-component/styles/filepicker.css';
import 'node_modules/dropzone/dist/min/dropzone.min.css';
import React, { Component } from 'react';
import DropzoneComponent from 'react-dropzone-component';

class Image extends Component {
  constructor(props){
    super(props)
    this.handleClick = this.handleClick.bind(this);
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



class Gallery extends Component {
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
      <a className='download-link' onClick={this.download}>Download all images as zip >>></a> : null
    return(
      <div>
        <div className='gallery'>
          <div className='edited-at'>Latest update on {this.props.gallery[2].substring(0, 10)}</div>
          {images}
        </div>
          {downloadLink}
      </div>
    )
  }
}



class GalleryLink extends Component {
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



class GalleryForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      password: '',
    };

    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);    
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleNameChange(e) {
    this.setState({ name: e.target.value });
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
    this.props.getGalleries(e.target.value, false);    
  }

  handleSubmit(e) {
    e.preventDefault();

    var thisComponent = this;
    jQuery.ajax({
      url: 'create_gallery',
      data: this.state,
      dataType: 'json',
      method: 'POST',
      success: function(data) {
        thisComponent.props.updateGalleries(data, true)
      },
      error: function(data) {
        console.log('ERROR! ' + data);
      }
    });
  }

  render() {
    return(
      <form className='gallery-creator' onSubmit={this.handleSubmit}>
        <input type="text" name="name" placeholder="Name" onChange={this.handleNameChange.bind(this)} />
        <input type="text" name="password" placeholder="Password" onChange={this.handlePasswordChange.bind(this)} /> 
        <input type="submit" value="Create gallery" />
      </form>
    )
  }
}



class App extends Component {
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
    this.linkColor = this.linkColor.bind(this);
  }

  activateGallery(gallery) {
    this.setState({ activeGallery: gallery });
    // show password in input field
    const password = gallery[3].split('___')[1]
    jQuery('input[name=password]').val(password);
  }

  updateGalleries(galleries, changeToLatest) {
    this.setState({ galleries: galleries });
    const latestChangedGallery = galleries.slice(-1)[0]; // last element of array (sorted on server)
    if (changeToLatest && latestChangedGallery && latestChangedGallery[1] != 'locked') {      
      this.setState({ activeGallery: latestChangedGallery });  
    };
  }

  linkColor(index) {
    return window.randomColors[index];
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
    const galleryLinks = this.state.galleries.map((gallery, index) =>
      <GalleryLink
        key={gallery[0]}
        gallery={gallery}
        onClick={this.activateGallery}
        active={(this.state.activeGallery !== null) && (gallery[0] == this.state.activeGallery[0])}
        color={this.linkColor(index)}
      />
    );
    
    let gallery = null;
    if (this.state.activeGallery != null) {
      gallery = <Gallery gallery={this.state.activeGallery} />
    };
    
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
          {galleryLinks}
        </div>

        <div className='gallery-container'>
          {gallery}
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
