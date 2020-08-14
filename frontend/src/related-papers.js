import React from 'react';

import './card.css';

const rankColor = '#ff9800';
const paperLink = 'https://www.ncbi.nlm.nih.gov/pmc/articles/';

export default ({ relatedPapers }) => (
  <section>
    <h3>Related Papers</h3>
    {relatedPapers.map(
      (
        { id, title, authors, year, journal, rank, distance, strength },
        index
      ) => (
        <div key={index} className='card'>
          <div
            className='score'
            title={'Distance score: ' + distance}
            style={{
              backgroundColor:
                rankColor +
                Math.floor((1 - strength) * 255)
                  .toString(16)
                  .padStart(2, '0'),
              borderColor: rankColor
            }}
          >
            {rank}
          </div>
          <div className='details'>
            <a href={paperLink + id} title={title}>
              {title}
            </a>
            <div title={authors}>{authors}</div>
            <div title={journal + ' · ' + year}>
              {journal} · {year}
            </div>
          </div>
        </div>
      )
    )}
  </section>
);
