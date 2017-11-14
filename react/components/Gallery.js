import '../random_colors';
import 'node_modules/react-dropzone-component/styles/filepicker.css';
import 'node_modules/dropzone/dist/min/dropzone.min.css';
import React, { Component } from 'react';
import DropzoneComponent from 'react-dropzone-component';

class Image extends Component {
  constructor(props){
    super(props)
    this.state = {
      isHovered: false
    }
    this.handleClick = this.handleClick.bind(this);
    this.handleHover = this.handleHover.bind(this);
  }

  handleClick(url) {
    this.props.onClick(url)
  }

  handleHover() {
    this.setState({
      isHovered: !this.state.isHovered
    });
  }

  render() {
    const sizeForNonActive = this.state.isHovered == true ? '110' : '100'
    return(
      <img
        src={this.props.url}
        height={this.props.active ? '500' : sizeForNonActive}
        onClick={this.handleClick.bind(this, this.props.index)}
        onMouseEnter={this.handleHover} onMouseLeave={this.handleHover}
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

  render() {    
    const images = this.props.images.map((image, index) =>
      <Image
        key={index} url={image[1]}
        index={index}
        active={index == this.state.activeImageIndex}
        onClick={this.activateImage}
      />
    );
    return(
      <div className='gallery'>
        {images}
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
        style={{color: this.props.color}} className={'gallery-link ' + (this.props.active ? 'active' : '')}
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

    var thisComponent = this; // since 'this' gets overwritten by ajax function
    jQuery.ajax({
      url: 'create_gallery',
      data: this.state,
      dataType: 'json',
      method: 'POST',
      success: function(data) {
        thisComponent.props.updategalleries(data, true)
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
      activegallery: null,
      uploadFolder: null,
      uploading: false,
    }
    this.activateGallery = this.activateGallery.bind(this);
    this.updategalleries = this.updategalleries.bind(this);
    this.getGalleries = this.getGalleries.bind(this);
    this.linkColor = this.linkColor.bind(this);
  }

  activateGallery(gallery) {
    this.setState({ activegallery: gallery })
  }

  updategalleries(galleries, changeToLatest) {
    this.setState({ galleries: galleries });
    const latestChangedGallery = galleries.slice(-1)[0]; // last element of array (sorted on server)
    if (changeToLatest && latestChangedGallery[1] != 'locked') {
      this.setState({ activegallery: latestChangedGallery });  
    };
  }

  currentgalleryImages() {
    if (this.state.activegallery !== null) {
      return this.state.activegallery[1]
    }
  }

  linkColor(index) {
    return window.randomColors[index];
  }

  addItems() {
    // set upload folder to current gallery if this drop starts a new queue.
    // otherwise keep the folder which was set at queue start
    if (!this.state.uploading) {
      this.setState({ uploadFolder:
        this.state.activegallery ?
          this.state.activegallery[3] :
          'New_' + Math.random().toString(36).substring(7)
      });
    };    
    this.setState({ uploading: true });    
  }

  finishUpload() {
    this.setState({ uploading: false });
    this.getGalleries(jQuery('input[name=password]').val(), true);
  }

  getGalleries(password, changeToLatest) {
    var thisComponent = this; // since 'this' gets overwritten by ajax function
    jQuery.ajax({
      url: 'get_galleries',
      data: { password: password },
      dataType: 'json',
      method: 'GET',
      success: function(data) {
        thisComponent.updategalleries(data, changeToLatest)
      },
      error: function(data) {
        console.log('ERROR! ' + data);
      }
    });
  }

  render() {
    const galleryLinks = this.state.galleries.map((gallery, index) =>
      <GalleryLink locked={false} key={gallery[0]}
        gallery={gallery}
        onClick={this.activateGallery}
        active={(this.state.activegallery !== null) && (gallery[0] == this.state.activegallery[0])}
        color={this.linkColor(index)}
      />
    );
    
    let gallery = null;
    if (this.state.activegallery != null) {
      gallery = <Gallery images={this.currentgalleryImages()} />
    } else {
      gallery = <div className='choose'><img src='choose.png' /></div>      
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
    }

    return(
      <div>
        <div className='form-container'>
          <GalleryForm
            updategalleries={this.updategalleries}
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
      </div>
    )
  }
}

export default App;
