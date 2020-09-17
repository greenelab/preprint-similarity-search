import React from 'react';

import color from 'color';

import Status from './status';

import './card.css';

const rankColorA = color('#ff980020');
const rankColorB = color('#ff9800');

const paperLink = 'https://www.ncbi.nlm.nih.gov/pmc/articles/';

// related papers section

export default ({ similarPapers }) => (
  <section id='similar-papers'>
    <h3>
      <i className='fas fa-scroll heading_icon'></i>Most Similar Papers
    </h3>
    {typeof similarPapers === 'string' && <Status message={similarPapers} />}
    {Array.isArray(similarPapers) &&
      similarPapers.map(
        (
          { id, title, authors, year, journal, rank, distance, strength },
          index
        ) => (
          <div key={index} className='card'>
            <div
              className='card_score'
              title={'Distance score: ' + distance}
              style={{ backgroundColor: rankColorB.mix(rankColorA, strength) }}
            >
              {rank}
            </div>
            <div className='card_details'>
              <a href={paperLink + id} title={title} className='card_detail'>
                {title}
              </a>
              <div
                title={authors}
                className='card_detail truncate'
                tabIndex='0'
              >
                {authors}
              </div>
              <div
                title={journal + ' · ' + year}
                className='card_detail truncate'
                tabIndex='0'
              >
                {journal} · {year}
              </div>
            </div>
          </div>
        )
      )}
  </section>
);