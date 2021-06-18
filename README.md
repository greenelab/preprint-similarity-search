# Preprint Similarity Search

[⭐ OPEN THE APP](https://greenelab.github.io/preprint-similarity-search/) to start using the tool right away

[📜 READ THE MANUSCRIPT](http://greenelab.github.io/annorxiver_manuscript) for technical details on the machine learning model behind the tool

[🤖 USE THE API](https://api-pss.greenelab.com/doi/10.1101/833400) like `https://api-pss.greenelab.com/doi/YOUR-DOI`

Based on the work and classifiers in the [AnnoRxiver project](http://github.com/greenelab/annorxiver/)

### About

This tool uses a machine learning model trained on 2.3 million [PubMed Central open access documents](https://www.ncbi.nlm.nih.gov/pmc/tools/openftlist/) 
to find similar papers and journals based on the textual content of your [bioRxiv](https://www.biorxiv.org/) or [medRxiv](https://www.medrxiv.org/) preprint.
These results can be used as a starting point when searching for a place to publish your paper.

The tool also provides a "map" of the PubMed Central documents, grouped into bins based on similar textual content, and shows you where your preprint 
falls on the map. Select a square to learn more about the papers in that bin.

The map also incorporates a set of 50 [principal components](https://en.wikipedia.org/wiki/Principal_component_analysis) (PCs) generated from bio/medRxiv.
Each PC represents two high level concepts characterized by keywords of various strengths, illustrated in the word cloud thumbnails above the map.
Select a thumbnail to color the map by that PC.
Deeper orange squares will be papers that correlate more with the orange keywords in the image, and vice versa for blue.
