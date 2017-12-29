import React from 'react';

export default class GalleryForm extends React.Component {
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
    this.props.getGalleries({
      password: e.target.value,
      changeToLatest: false,
    });
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
        thisComponent.props.updateGalleries({
          galleries: data,
          changeToLatest: true
        })
      },
      error: function(data) {
        console.log('ERROR! ' + data);
      }
    });
  }

  render() {
    return(
      <form className='gallery-creator' onSubmit={this.handleSubmit}>
        <div>
          <input type="text" name="password" placeholder="Password" onChange={this.handlePasswordChange.bind(this)} />
        </div>
        <div>
          <input type="text" name="name" placeholder="Name" onChange={this.handleNameChange.bind(this)} />
          <input type="submit" value="Create gallery" />
        </div>
      </form>
    )
  }
}
