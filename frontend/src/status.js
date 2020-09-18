import React from 'react';

import './status.css';

// status key codes
export const empty = 'EMPTY';
export const loading = 'LOADING';
export const success = 'SUCCESS';

// loading/error status component

export default ({ status }) => {
  if (status === empty) {
    return (
      <section className='center gray'>
        <i className='fas fa-exclamation icon_with_text'></i>
        <span>Search for a doi</span>
      </section>
    );
  }

  if (status === loading) {
    return (
      <section className='center gray'>
        <i className='fas fa-spinner fa-spin icon_with_text'></i>
        <span>Loading...</span>
      </section>
    );
  }

  if (status === success)
    return null;

  return (
    <section className='center red'>
      <i className='far fa-times-circle icon_with_text'></i>
      <span>{status || "Couldn't get results"}</span>
    </section>
  );
};
