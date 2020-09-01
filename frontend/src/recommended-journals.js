import React from 'react';

import color from 'color';

import Status from './status';
import { success } from './status';

import './card.css';

const rankColorA = color('#ff980020');
const rankColorB = color('#ff9800');

const googleLink = 'https://www.google.com/search?q=';

// recommended journals section

export default ({ recommendedJournals, status }) => (
  <section id='recommended-journals'>
    <h3>
      <i className='fas fa-bookmark heading_icon'></i>Recommended Journals
    </h3>
    {status !== success && <Status {...{ status }} />}
    {status === success &&
      recommendedJournals.map(
        ({ journal, rank, distance, strength }, index) => (
          <div key={index} className='card'>
            <div
              className='card_score'
              title={'Distance score: ' + distance}
              style={{
                backgroundColor: rankColorB.mix(rankColorA, strength)
              }}
            >
              {rank}
            </div>
            <div className='card_details'>
              <a href={googleLink + journal}>{journal}</a>
            </div>
          </div>
        )
      )}
  </section>
);
