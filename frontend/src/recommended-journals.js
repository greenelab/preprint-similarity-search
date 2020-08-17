import React from 'react';

import './card.css';

const rankColor = '#ff9800';
const googleLink = 'https://www.google.com/search?q=';

// recommended journals section

export default ({ recommendedJournals }) => (
  <section>
    <h3>Recommended Journals</h3>
    {recommendedJournals.map(({ journal, rank, distance, strength }, index) => (
      <div key={index} className='card'>
        <div
          className='card_score'
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
        <div className='card_details'>
          <a href={googleLink + journal}>{journal}</a>
        </div>
      </div>
    ))}
  </section>
);
