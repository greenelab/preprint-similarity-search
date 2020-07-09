let testResponse = {
  paper_neighbors: [
    {
      distance: 2.676,
      journal: "FEMS_Microbiol_Lett",
      pmcid: "PMC5812519",
    },
    {
      distance: 2.828,
      journal: "Ann_Glob_Health",
      pmcid: "PMC6748305",
    },
    {
      distance: 2.833,
      journal: "EJIFCC",
      pmcid: "PMC4975198",
    },
    {
      distance: 2.903,
      journal: "J_Med_Libr_Assoc",
      pmcid: "PMC6774547",
    },
    {
      distance: 2.974,
      journal: "J_Med_Libr_Assoc",
      pmcid: "PMC6013126",
    },
    {
      distance: 2.977,
      journal: "Iran_J_Public_Health",
      pmcid: "PMC3481634",
    },
    {
      distance: 2.98,
      journal: "J_Pharmacol_Pharmacother",
      pmcid: "PMC3142758",
    },
    {
      distance: 2.99,
      journal: "J_Pathol_Inform",
      pmcid: "PMC2929539",
    },
    {
      distance: 3.004,
      journal: "J_Med_Libr_Assoc",
      pmcid: "PMC6919981",
    },
    {
      distance: 3.019,
      journal: "J_Med_Libr_Assoc",
      pmcid: "PMC6013140",
    },
  ],
  journal_neighbors: [
    {
      distance: 2.982,
      journal: "J_Med_Libr_Assoc",
    },
    {
      distance: 3.315,
      journal: "J_Microbiol_Biol_Educ",
    },
    {
      distance: 3.462,
      journal: "JMIR_Med_Educ",
    },
    {
      distance: 3.527,
      journal: "Online_J_Public_Health_Inform",
    },
    {
      distance: 3.531,
      journal: "Scientometrics",
    },
    {
      distance: 3.577,
      journal: "CBE_Life_Sci_Educ",
    },
    {
      distance: 3.629,
      journal: "GMS_Z_Med_Ausbild",
    },
    {
      distance: 3.661,
      journal: "Int_J_Telerehabil",
    },
    {
      distance: 3.662,
      journal: "Health_Res_Policy_Syst",
    },
    {
      distance: 3.667,
      journal: "JMIR_Public_Health_Surveill",
    },
  ],
};

// lookup resources
const googleLookup = "https://www.google.com/search?q=";
const pubMedLookup = "https://www.ncbi.nlm.nih.gov/pmc/articles/";

// dom elements
let searchInput = document.querySelector("#search_input");
let searchButton = document.querySelector("#search_button");
let loadingMessage = document.querySelector("#loading_message");
let emptyMessage = document.querySelector("#empty_message");
let errorMessage = document.querySelector("#error_message");
let journalsSection = document.querySelector("#journals_section");
let papersSection = document.querySelector("#papers_section");
let journalCard = document.querySelector("#journals_section template");
let paperCard = document.querySelector("#papers_section template");

// backend server
let server = "";

// global var to hold search box text
let query = "";

// global vars to hold journal and paper results from backend query
let journals = [];
let papers = [];

// when user types into search box
const onType = (event) => (query = event.target.value);

// await-async-able timer function
const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

// when user clicks search button
const onSearch = async () => {
  // show loading message
  showLoading();
  try {
    await sleep(1000);
    // get results from backend
    // let result = await await fetch(server + "/" + query).json();
    let result = testResponse;

    // extract journals and papers
    journals = result.journal_neighbors;
    papers = result.paper_neighbors;

    // if results empty, throw an error
    if (!journals.length || !papers.length) throw Error("Empty response");

    // otherwise, clean and show results
    journals = cleanArray(journals);
    papers = cleanArray(papers);
    showResults();
  } catch (error) {
    // if any error occurs, show error message
    showError();
    console.error(error);
  }
};

// show loading message and hide other messages and results
const showLoading = () => {
  loadingMessage.style.display = "block";
  errorMessage.style.display = "none";
  journalsSection.style.display = "none";
  papersSection.style.display = "none";
};

// show error message and hide other messages and results
const showError = () => {
  loadingMessage.style.display = "none";
  errorMessage.style.display = "block";
  journalsSection.style.display = "none";
  papersSection.style.display = "none";
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

  // set new values of array
  array = array.map((entry, index) => ({
    name: (entry.journal || "").split("_").join(" "), // name of journal
    distance: entry.distance, // distance score
    strength: (entry.distance - min) / diff, // normalized distance score
    rank: index + 1, // rank
    pmcid: entry.pmcid || null, // pubmed id
  }));

  return array;
};

// make list of journal or paper result cards
const makeCards = (list, template, section) => {
  for (const { rank, name, pmcid, distance, strength } of list) {
    // clone template to make new card
    let clone = template.content.cloneNode(true);

    // get sub elements of clone
    let score = clone.querySelector(".score");
    let nameLink = clone.querySelector(".name a");
    let pmcidLink = clone.querySelector(".pmcid a");

    // set score element
    score.innerHTML = rank;
    score.title = "Distance score: " + distance;
    score.style.background =
      "#ffcc80" +
      Math.floor((1 - 0.75 * strength) * 255)
        .toString(16)
        .padStart(2, "0");

    // set name element
    nameLink.href = googleLookup + name;
    nameLink.innerHTML = name;

    // set or remove pmcid element
    if (pmcid) {
      pmcidLink.href = pubMedLookup + pmcid;
      pmcidLink.innerHTML = pmcid;
    } else clone.querySelector(".pmcid").remove();

    // attach new clone to section
    section.append(clone);
  }
};

// show results and hide messages
const showResults = () => {
  loadingMessage.style.display = "none";
  errorMessage.style.display = "none";
  journalsSection.style.display = "block";
  papersSection.style.display = "block";

  // delete any existing result elements
  const journalCards = document.querySelectorAll("#journals_section .card");
  const paperCards = document.querySelectorAll("#papers_section .card");
  for (const journalCard of journalCards) journalCard.remove();
  for (const paperCard of paperCards) paperCard.remove();

  // make new journal and paper cards
  makeCards(journals, journalCard, journalsSection);
  makeCards(papers, paperCard, papersSection);
};

// add input triggers
searchInput.addEventListener("input", onType);
searchButton.addEventListener("click", onSearch);
