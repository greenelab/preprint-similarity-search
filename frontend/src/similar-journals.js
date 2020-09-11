import React from 'react';

import color from 'color';

import Status from './status';
import { success } from './status';

import './card.css';

const rankColorA = color('#ff980020');
const rankColorB = color('#ff9800');

const googleLink = 'https://www.google.com/search?q=';

// similar journals section

export default ({ similarJournals, status }) => (
  <section id='similar-journals'>
    <h3>
      <i className='fas fa-bookmark heading_icon'></i>Most Similar Journals
    </h3>
    {status !== success && <Status {...{ status }} />}
    {status === success &&
      similarJournals.map(({ journal, rank, distance, strength }, index) => (
        <div key={index} className='card'>
          <div
            className='card_score'
            title={'Distance score: ' + distance}
            style={{ backgroundColor: rankColorB.mix(rankColorA, strength) }}
          >
            {rank}
          </div>
          <div className='card_details'>
            <a href={googleLink + journal} className='card_detail'>
              {journal}
            </a>
          </div>
        </div>
      ))}
  </section>
);
