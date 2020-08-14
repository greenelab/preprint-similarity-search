import React from 'react';
import { useState } from 'react';

import { getNeighbors } from './neighbors';
import { getMetadata } from './neighbors';
import { cleanNeighbors } from './neighbors';
import { loading, success, error } from './status';

import './search.css';

export default ({
  status,
  setStatus,
  setRecommendedJournals,
  setRelatedPapers,
  setCoordinates
}) => {
  // default query
  const [query, setQuery] = useState('10.1101/833400');

  // on type
  const onChange = (event) => {
    const newQuery = event.target.value.trim();
    // remove everything before first number, eg "doi:"
    const index = newQuery.search(/\d/);

    if (index !== -1)
      setQuery(newQuery.substr(index));
    // if no number, can't be a valid doi, so set query to empty
    else
      setQuery('');
  };

  // on search
  const onSubmit = async (event) => {
    setStatus(loading);
    event.preventDefault();
    if (!query)
      return;

    try {
      const {
        recommendedJournals,
        relatedPapers,
        coordinates
      } = await cleanNeighbors(await getMetadata(await getNeighbors(query)));

      setRecommendedJournals(recommendedJournals);
      setRelatedPapers(relatedPapers);
      setCoordinates(coordinates);
      setStatus(success);
    } catch (errorMessage) {
      console.log(errorMessage);
      setStatus(error);
    }
  };

  return (
    <section>
      <p className='center'>
        <i>
          Enter the <a href='https://www.biorxiv.org/'>bioRxiv</a> DOI of your
          preprint
        </i>
      </p>
      <form className='search' onSubmit={onSubmit}>
        <input
          className='search_input'
          value={query}
          onChange={onChange}
          type='text'
          placeholder='e.g. 10.1101/833400'
          disabled={status === 'LOADING'}
        />
        <button
          className='search_button'
          type='submit'
          title='Search for related papers and journals'
          disabled={status === 'LOADING'}
        >
          <i className='fas fa-search'></i>
        </button>
      </form>
    </section>
  );
};
