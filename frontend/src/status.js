import React from 'react';

import './status.css';

// status key codes
export const empty = 'EMPTY';
export const loading = 'LOADING';

// loading/error message component

export default ({ message }) => {
  if (message === empty) {
    return (
      <section className='center gray'>
        <i className='fas fa-exclamation icon_with_text'></i>
        <span>Search for a doi</span>
      </section>
    );
  }

  if (message === loading) {
    return (
      <section className='center gray'>
        <i className='fas fa-spinner fa-spin icon_with_text'></i>
        <span>Loading...</span>
      </section>
    );
  }

  return (
    <section className='center red'>
      <i className='far fa-times-circle icon_with_text'></i>
      <span>{message || "Couldn't get results"}</span>
    </section>
  );
};
