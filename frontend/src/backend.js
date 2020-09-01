const crossRef = 'https://api.crossref.org/works/';

// lookup metadata info for queried preprint from crossref
export const getPreprintInfo = async (query) => {
  // look up info
  const { message: info } = await (await fetch(crossRef + query)).json();
  console.log(info);

  // rename and normalize props
  let { title: preprintTitle, URL: preprintUrl } = info;
  preprintTitle = preprintTitle.flat().join(' ');

  // return results
  return { preprintTitle, preprintUrl };
};

const backendServer = 'https://api-journal-rec.greenelab.com/doi/';

// get neighbor and coordinate data from backend
export const getNeighbors = async (query) => {
  // lookup data from backend
  const neighbors = await (await fetch(backendServer + query)).json();

  // extract results
  const similarJournals = neighbors.journal_neighbors || [];
  const similarPapers = neighbors.paper_neighbors || [];
  const coordinates = {
    x: neighbors['2d_coord'].dim1,
    y: neighbors['2d_coord'].dim2
  };

  // remove "PMC" prefix from PMCID's
  const removePMC = (entry) =>
    (entry.pmcid = (entry.pmcid || entry.document || '').replace('PMC', ''));
  similarJournals.forEach(removePMC);
  similarPapers.forEach(removePMC);

  // return results
  return { similarJournals, similarPapers, coordinates };
};

const metaLookup =
  'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pmc&tool=AnnoRxivir&email=greenescientist@gmail.com&retmode=json&id=';

// look up journal or paper metadata from nih.gov
export const getNeighborsMetadata = async (array) => {
  // get pmcid's for looking up meta data
  const ids = array.map((entry) => entry.pmcid).filter((entry) => entry);

  // lookup metadata
  const metadata = (await (await fetch(metaLookup + ids.join(','))).json())
    .result;

  // incorp meta data into journal/paper objects
  const incorp = (entry) => ({ ...entry, ...(metadata[entry.pmcid] || {}) });
  array = array.map(incorp);

  // return results
  return array;
};

// clean journal or paper neighbor data to handle more conveniently
export const cleanNeighbors = (array) => {
  // get range of distances
  const distances = array.map((entry) => entry.distance);
  const max = Math.max(...distances);
  const min = Math.min(...distances);
  const diff = max - min;

  // sort by smaller distances first
  array.sort((a, b) => a.distance - b.distance);

  // set new values of array. keep only needed props and rename sensibly
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
