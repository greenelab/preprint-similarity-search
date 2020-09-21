import React from 'react';

const link = 'https://doi.org/';

// preprint info section

export default ({ preprint: { id, title, authors, journal, year } }) => (
  <section id='your-preprint'>
    <h3>
      <i className='fas fa-feather-alt heading_icon'></i>Your Preprint
    </h3>
    <p>
      <a href={link + id} title={title} className='card_detail'>
        {title}
      </a>
      <span title={authors} className='card_detail truncate' tabIndex='0'>
        {authors}
      </span>
      <span
        title={journal + ' · ' + year}
        className='card_detail truncate'
        tabIndex='0'
      >
        {journal} · {year}
      </span>
    </p>
  </section>
);
