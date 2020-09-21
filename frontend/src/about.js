import React from 'react';

// about section

export default () => (
  <section id='help'>
    <h3>
      <i className='fas fa-question-circle heading_icon'></i>About this tool
    </h3>
    <p>
      This tool uses a machine learning model trained on 1.7 million{' '}
      <a href='https://www.ncbi.nlm.nih.gov/pmc/tools/openftlist/'>
        PubMed Central open access documents
      </a>{' '}
      to recommend suitable journals based on the textual content of your{' '}
      <a href='https://www.biorxiv.org/'>bioRxiv</a> or{' '}
      <a href='https://www.medrxiv.org/'>medRxiv</a> preprint.
    </p>
    <p>
      The tool also provides a "map" of the PubMed Central documents, grouped
      into bins based on similar textual content, and shows you where your
      preprint falls on the map. Select a square to learn more about the papers
      in that bin.
    </p>
    <p>
      The map also incorporates a set of 50{' '}
      <a href='https://en.wikipedia.org/wiki/Principal_component_analysis'>
        principal components
      </a>{' '}
      (PCs) generated from bioRxiv. Each PC represents two high level concepts
      characterized by keywords of various strengths, illustrated in the word
      cloud thumbnails above the map. Select a thumbnail to color the map by
      that PC. Deeper orange squares will be papers that correlate more with the
      orange keywords in the image, and vice versa for blue.
    </p>
    <p>
      For more information, see the{' '}
      <a href='https://github.com/greenelab/annorxiver-journal-recommender#annorxiver-journal-recommender'>
        readme on GitHub
      </a>
      .
    </p>
  </section>
);
