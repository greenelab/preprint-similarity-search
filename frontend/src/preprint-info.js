import React from 'react';

import Status from './status';

// preprint info section

export default ({ preprintTitle, preprintUrl, status }) => (
  <section id='your-preprint'>
    <h3>
      <i className='fas fa-feather-alt heading_icon'></i>Your Preprint
    </h3>
    {!(preprintTitle && preprintUrl) && <Status {...{ status }} />}
    {preprintTitle && preprintUrl && (
      <p className='center'>
        <a href={preprintUrl}>{preprintTitle}</a>
      </p>
    )}
  </section>
);
