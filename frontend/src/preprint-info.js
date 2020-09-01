import React from 'react';

export default ({ preprintTitle, preprintUrl }) => (
  <section id='recommended-journals'>
    <h3>
      <i className='fas fa-feather-alt heading_icon'></i>Your Preprint
    </h3>
    <p className='center'>
      <a href={preprintUrl}>{preprintTitle}</a>
    </p>
  </section>
);
