import '../random_color_generator';
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
    const images = this.props.images.map((url, index) =>
      <Image
        key={index} url={url}
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
    return(
      <span
        style={{color: getRandomColor()}} className={'gallery-link ' + (this.props.active ? 'active' : '')}
        onClick={this.handleClick.bind(this, this.props.gallery)}>
        {this.props.gallery[0]}
      </span>
    )
  }
}



class GalleryCreator extends Component {
  constructor(props) {
    super(props);
    this.state = { name: '' };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ name: e.target.value });
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
        thisComponent.props.updategalleries(data)
      },
      error: function(data) {
        console.log('ERROR! ' + data);
      }
    });
  }

  render() {
    return(
      <form className='gallery-creator' onSubmit={this.handleSubmit}>
        <input type="text" name="name" onChange={this.handleChange.bind(this)} />
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
    this.activategallery = this.activategallery.bind(this);
    this.updategalleries = this.updategalleries.bind(this);  
  }

  activategallery(gallery) {
    this.setState({ activegallery: gallery })
  }

  updategalleries(galleries) {
    this.setState({ galleries: galleries });
    const latestChangedgallery = galleries.slice(-1)[0];
    this.setState({ activegallery: latestChangedgallery });  
  }

  currentgalleryImages() {
    if (this.state.activegallery !== null) {
      return this.state.activegallery[1]
    }
  }

  dropItems() {
    // set upload folder to current gallery if this drop starts a new queue.
    // otherwise keep the folder set at queue start
    if (!this.state.uploading) {
      this.setState({ uploadFolder:
        this.state.activegallery ?
          this.state.activegallery[0] :
          'New_' + Math.random().toString(36).substring(7)
      });
    };
    this.setState({ uploading: true });    
  }

  finishUpload() {
    this.setState({ uploading: false });    
    var thisComponent = this; // since 'this' gets overwritten by ajax function    
    jQuery.ajax({
      url: 'galleries',
      dataType: 'json',      
      method: 'GET',
      success: function(galleries) {
        thisComponent.updategalleries(galleries);     
      },
      error: function(data) {
        console.log('ERROR! ' + data);
      }
    });
  }

  render() {
    const galleryLinks = this.state.galleries.map((gallery, index) =>
      <GalleryLink
        key={index}
        gallery={gallery}
        onClick={this.activategallery}
        active={(this.state.activegallery !== null) && (gallery[0] == this.state.activegallery[0])}
      />
    );
    
    let gallery = null;
    if (this.state.activegallery != null) {
      gallery = <Gallery images={this.currentgalleryImages()} />
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
      drop: () => this.dropItems(),
      queuecomplete: () => this.finishUpload(),
    }

    return(
      <div>
        <div className='header'>
          MOSTLYCOLORED
        </div>

        <div className='gallery-creator-container'>
          <GalleryCreator updategalleries={this.updategalleries} />
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
