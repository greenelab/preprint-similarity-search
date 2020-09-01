import React from 'react';

// about section

export default () => (
  <section id='help'>
    <h3>
      <i className='fas fa-question-circle heading_icon'></i>About this tool
    </h3>
    <p>
      This tool uses a machine learning model trained on 1.7 million{' '}
      <a href='https://www.ncbi.nlm.nih.gov/pmc/'>PubMed Central</a> documents
      to recommend suitable journals based on the textual content of your{' '}
      <a href='https://www.biorxiv.org/'>bioRxiv</a> preprint. For information
      on how this works, see the{' '}
      <a href='https://github.com/greenelab/annorxiver-journal-recommender#annorxiver-journal-recommender'>
        readme on GitHub
      </a>
      .
    </p>
    <p>
      This tool also gives you a "map" of all of the documents on{' '}
      <a href='https://www.ncbi.nlm.nih.gov/pmc/'>PubMed Central</a>, and shows
      you where your preprint falls in it. The map groups papers together by
      count and by 50 "axes" of similarity called <i>principal components</i>{' '}
      (PC's).
    </p>
    <p>
      Each PC has keywords of various strengths, illustrated in the word cloud
      thumbnails above the map. Select a thumbnail to color the map by that
      specific PC. Deeper orange cells will be papers that correlate more with
      the orange keywords in the image, and vice versa for blue.
    </p>
  </section>
);
