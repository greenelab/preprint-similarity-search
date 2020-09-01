import React from 'react';
import { useState } from 'react';

import Header from './header';
import Search from './search';
import PreprintInfo from './preprint-info';
import Status from './status';
import RecommendedJournals from './recommended-journals';
import RelatedPapers from './related-papers';
import MapSection from './map-section';
import About from './about';
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
        {status === success && <PreprintInfo />}
        <Status {...{ status }} />
        {status === success && (
          <>
            <RecommendedJournals {...{ recommendedJournals }} />
            <hr />
          </>
        )}
        {status === success && (
          <>
            <RelatedPapers {...{ relatedPapers }} />
            <hr />
          </>
        )}
        <MapSection {...{ coordinates }} />
        <hr />
        <About />
      </main>
      <Footer />
    </>
  );
};
