import React from 'react';

import Status from './status';

// preprint info section

export default ({ preprint }) => (
  <section id='your-preprint'>
    <h3>
      <i className='fas fa-feather-alt heading_icon'></i>Your Preprint
    </h3>
    {typeof preprint === 'string' && <Status message={preprint} />}
    {typeof preprint === 'object' && Object.keys(preprint).length !== 0 && (
      <p>
        <a href={preprint.url} title={preprint.title} className='card_detail'>
          {preprint.title}
        </a>
        <span
          title={preprint.authors}
          className='card_detail truncate'
          tabIndex='0'
        >
          {preprint.authors}
        </span>
        <span
          title={preprint.journal + ' · ' + preprint.year}
          className='card_detail truncate'
          tabIndex='0'
        >
          {preprint.journal} · {preprint.year}
        </span>
      </p>
    )}
  </section>
);
