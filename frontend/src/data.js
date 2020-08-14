const backendServer = 'https://api-journal-rec.greenelab.com/doi/';

// get neighbor and coordinate data from backend
export const getData = async (query) => {
  // lookup data from backend
  const neighbors = await (await fetch(backendServer + query)).json();

  // extract results
  const recommendedJournals = neighbors.journal_neighbors || [];
  const relatedPapers = neighbors.paper_neighbors || [];
  const coordinates = {
    x: neighbors['2d_coord'].dim1,
    y: neighbors['2d_coord'].dim2
  };

  // remove "PMC" prefix from PMCID's
  const removePMC = (entry) =>
    (entry.pmcid = (entry.pmcid || entry.document || '').replace('PMC', ''));
  recommendedJournals.forEach(removePMC);
  relatedPapers.forEach(removePMC);

  return { recommendedJournals, relatedPapers, coordinates };
};

const metaLookup =
  'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pmc&tool=AnnoRxivir&email=greenescientist@gmail.com&retmode=json&id=';

// look up metadata from nih.gov
export const getMetadata = async ({
  recommendedJournals,
  relatedPapers,
  ...rest
}) => {
  // get pmcid's of all relatedPapers for looking up meta data
  const ids = [...recommendedJournals, ...relatedPapers]
    .map((entry) => entry.pmcid)
    .filter((entry) => entry);
  // lookup metadata from pubmed
  const metadata = (await (await fetch(metaLookup + ids.join(','))).json())
    .result;

  // incorp meta data into journal and paper objects
  const incorp = (entry) => ({ ...entry, ...(metadata[entry.pmcid] || {}) });
  recommendedJournals = recommendedJournals.map(incorp);
  relatedPapers = relatedPapers.map(incorp);

  return { recommendedJournals, relatedPapers, ...rest };
};

// clean data to handle more conveniently
export const cleanData = ({ recommendedJournals, relatedPapers, ...rest }) => {
  recommendedJournals = cleanArray(recommendedJournals);
  relatedPapers = cleanArray(relatedPapers);

  return { recommendedJournals, relatedPapers, ...rest };
};

// clean array of journal or paper results
const cleanArray = (array) => {
  // get range of distances
  const distances = array.map((entry) => entry.distance);
  const max = Math.max(...distances);
  const min = Math.min(...distances);
  const diff = max - min;

  // sort by smaller distances first
  array.sort((a, b) => a.distance - b.distance);

  // set new values of array. keep only needed props and rename sensically
  array = array.map((entry, index) => ({
    // pubmed id
    id: entry.pmcid || null,
    // name of paper
    title: entry.title || '',
    // authors of paper
    authors: (entry.authors || [])
      .map((author) => author.name || '')
      .filter((name) => name)
      .join(', '),
    // name of journal
    journal: (entry.fulljournalname || entry.journal || '')
      .split('_')
      .join(' '),
    // year of publication
    year: (entry.pubdate || '').split(' ')[0] || '',
    // distance score
    distance: entry.distance,
    // normalized distance score
    strength: (entry.distance - min) / diff,
    // whole number rank
    rank: index + 1
  }));

  return array;
};
