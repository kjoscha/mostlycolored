import React from 'react';

export default function Image(props) {
  return(
    <img
      src={props.url}
      className={props.active ? 'active' : ''}
      onClick={() =>  props.onClick(props.index)}
    />
  )
}
