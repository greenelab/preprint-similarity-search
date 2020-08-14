import React from 'react';
import { useState } from 'react';

import Header from './header';
import Search from './search';
import Status from './status';
import RecommendedJournals from './recommended-journals';
import RelatedPapers from './related-papers';
import Map from './map';
import About from './about';
import Footer from './footer';

import './app.css';

import { empty, success } from './status';

export default () => {
  const [status, setStatus] = useState(empty);
  const [recommendedJournals, setRecommendedJournals] = useState([]);
  const [relatedPapers, setRelatedPapers] = useState([]);
  const [coordinates, setCoordinates] = useState({});

  console.log({ recommendedJournals, relatedPapers, coordinates });

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
        <Map/>
        <About />
      </main>
      <Footer />
    </>
  );
};
