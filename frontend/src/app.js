import React from 'react';
import { useState } from 'react';

import Header from './header';
import Search from './search';
import Status from './status';
import RecommendedJournals from './recommended-journals';
import RelatedPapers from './related-papers';
import Map from './map';
import About from './about';
import Continue from './continue';
import Footer from './footer';

import './app.css';

import { empty, success } from './status';

// main app component

export default () => {
  // data status
  const [status, setStatus] = useState(empty);

  // main data
  const [recommendedJournals, setRecommendedJournals] = useState([]);
  const [relatedPapers, setRelatedPapers] = useState([]);
  const [coordinates, setCoordinates] = useState({});

  // render
  return (
    <>
      <Header />
      <main>
        <Search
          {...{
            status,
            setStatus,
            setRecommendedJournals,
            setRelatedPapers,
            setCoordinates
          }}
        />
        <Status {...{ status }} />
        {status === success && (
          <RecommendedJournals {...{ recommendedJournals }} />
        )}
        {status === success && <RelatedPapers {...{ relatedPapers }} />}
        <Map {...{ coordinates }} />
        <About />
        <Continue />
      </main>
      <Footer />
    </>
  );
};
