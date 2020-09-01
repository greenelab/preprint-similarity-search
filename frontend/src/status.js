import React from 'react';

import './status.css';

// status key codes
export const empty = '';
export const loading = 'LOADING';
export const error = 'ERROR';
export const success = 'SUCCESS';

// loading/error message component

export default ({ status }) => {
  if (status === loading) {
    return (
      <section className='center'>
        <div className='loading'>
          <i className='fas fa-spinner fa-spin icon_with_text'></i>
          <span>Loading...</span>
        </div>
      </section>
    );
  }

  if (status === error) {
    return (
      <section className='center'>
        <div className='error'>
          <i className='far fa-times-circle icon_with_text'></i>
          <span>Couldn't get results</span>
        </div>
      </section>
    );
  }

  return null;
};
