import React from 'react';

import color from 'color';

import './card.css';

const rankColorA = color('#ff980020');
const rankColorB = color('#ff9800');

const paperLink = 'https://www.ncbi.nlm.nih.gov/pmc/articles/';

// related papers section

export default ({ relatedPapers }) => (
  <section id='related-papers'>
    <h3>
      <i className='fas fa-scroll'></i>Related Papers
    </h3>
    {relatedPapers.map(
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
            <a href={paperLink + id} title={title}>
              {title}
            </a>
            <div title={authors} className='truncate'>
              {authors}
            </div>
            <div title={journal + ' · ' + year} className='truncate'>
              {journal} · {year}
            </div>
          </div>
        </div>
      )
    )}
  </section>
);
