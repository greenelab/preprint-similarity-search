import React from 'react';

import color from 'color';

import './card.css';

const rankColorA = color('#ff980020');
const rankColorB = color('#ff9800');

const link = 'https://www.google.com/search?q=';

// similar journals section

export default ({ similarJournals }) => (
  <section id='similar-journals'>
    <h3>
      <i className='fas fa-bookmark'></i>
      <span>Most Similar Journals</span>
    </h3>
    {similarJournals.map(({ journal, rank, distance, strength }, index) => (
      <div key={index} className='card'>
        <div
          className='card_score'
          title={'Distance score: ' + distance}
          style={{ backgroundColor: rankColorB.mix(rankColorA, strength) }}
        >
          {rank}
        </div>
        <div className='card_details'>
          <a href={link + journal} className='card_detail'>
            {journal}
          </a>
        </div>
      </div>
    ))}
  </section>
);
