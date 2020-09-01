import React from 'react';
import { useState } from 'react';

import Header from './header';
import Search from './search';
import PreprintInfo from './preprint-info';
import RecommendedJournals from './recommended-journals';
import RelatedPapers from './related-papers';
import MapSection from './map-section';
import About from './about';
import Footer from './footer';

import './app.css';

import { empty } from './status';

// main app component

export default () => {
  // data status
  const [status, setStatus] = useState(empty);

  // main data
  const [preprintTitle, setPreprintTitle] = useState('');
  const [preprintUrl, setPreprintUrl] = useState('');
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
            preprintTitle,
            preprintUrl,
            setPreprintTitle,
            setPreprintUrl,
            status,
            setStatus,
            setRecommendedJournals,
            setRelatedPapers,
            setCoordinates
          }}
        />
        {preprintTitle && preprintUrl && (
          <PreprintInfo {...{ preprintTitle, preprintUrl }} />
        )}
        {status !== empty && <RelatedPapers {...{ relatedPapers, status }} />}
        {status !== empty && (
          <RecommendedJournals {...{ recommendedJournals, status }} />
        )}
        <MapSection {...{ coordinates }} />
        <About />
      </main>
      <Footer />
    </>
  );
};
