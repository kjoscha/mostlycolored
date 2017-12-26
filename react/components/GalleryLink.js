import React from 'react';

export default function GalleryLink(props) {
  return(
    <span
      style={{color: props.color, border: props.active ? ('1px solid ' + props.color) : '1px solid black'}}
      className={'gallery-link ' + (props.active ? 'active' : '')}
      onClick={() => props.onClick(props.gallery)}>
      {props.gallery[0]}
    </span>
  )
}
