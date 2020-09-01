import React, { useEffect } from 'react';
import { useState } from 'react';
import { useCallback } from 'react';

import { getNeighbors } from './neighbors';
import { getMetadata } from './neighbors';
import { cleanNeighbors } from './neighbors';
import { loading, success, error } from './status';

import './search.css';

// search box component

export default ({
  status,
  setStatus,
  setRecommendedJournals,
  setRelatedPapers,
  setCoordinates
}) => {
  // default query
  const [query, setQuery] = useState(getUrl() || '');

  // on type
  const onChange = useCallback(
    (event) => setQuery(event.target.value.trim()),
    []
  );

  // search
  const search = useCallback(
    async (doi, updateUrl = true) => {
      // clean doi
      doi = cleanDoi(doi);

      // update search box with cleaned doi
      setQuery(doi);

      // exit if doi query empty
      if (!doi)
        return;

      // set loading status
      setStatus(loading);

      // update url based on search
      if (updateUrl)
        setUrl(doi);

      try {
        // get neighbor data
        const {
          recommendedJournals,
          relatedPapers,
          coordinates
        } = await cleanNeighbors(await getMetadata(await getNeighbors(doi)));

        // set neighbor data
        setRecommendedJournals(recommendedJournals);
        setRelatedPapers(relatedPapers);
        setCoordinates(coordinates);
        setStatus(success);
      } catch (errorMessage) {
        console.log(errorMessage);
        // set error status if any problem
        setStatus(error);
      }
    },
    [setCoordinates, setRecommendedJournals, setRelatedPapers, setStatus]
  );

  // when user navigates back/forward
  const onNav = useCallback(() => {
    // get new doi
    const doi = getUrl();
    if (!doi)
      return;
    // put doi in search box
    setQuery(doi);
    // run search, without updating url since browser does this automatically
    search(doi, false);
  }, [search]);

  // search for doi in url if any on first load
  useEffect(() => {
    if (getUrl())
      search(getUrl());
  }, [search]);

  // listen for user back/forward nav
  useEffect(() => {
    window.addEventListener('popstate', onNav);
    return () => window.removeEventListener('popstate', onNav);
  }, [onNav, search]);

  // render
  return (
    <section id='search'>
      <p className='center'>
        <i>
          Enter the <a href='https://www.biorxiv.org/'>bioRxiv</a> DOI of your
          preprint
        </i>
      </p>
      <form
        className='search'
        onSubmit={(event) => {
          // prevent page from navigating away/refreshing on submit
          event.preventDefault();
          // run search
          search(query);
        }}
      >
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

// clean what user types into search box for convenience
// remove everything before first number, eg "doi:"
// remove version at end, eg "v4"
const cleanDoi = (query) =>
  query.replace(/^\D*/g, '').replace(/v\d+$/g, '').trim();

// get doi from url
const getUrl = () =>
  new URLSearchParams(window.location.search.substring(1)).get('doi');

// put doi in url as param
const setUrl = (doi) => {
  const oldUrl = window.location.href;
  const base = window.location.href.split(/[?#]/)[0];
  const newUrl = base + '?doi=' + doi;
  // compare old to new url to prevent duplicate history entries when refreshing
  if (oldUrl !== newUrl)
    window.history.pushState(null, null, newUrl);
};
