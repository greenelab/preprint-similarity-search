# AnnoRxiver Journal Recommender

Enter a BioRxiv preprint and get a list of journals that would be most suited to publish your paper.
Available as a web app and a server.

[⭐ OPEN THE APP ⭐](https://greenelab.github.io/annorxiver-journal-recommender/)

### About this tool

This tool uses a machine learning model trained on 1.7 million [PubMed Central open access documents](https://www.ncbi.nlm.nih.gov/pmc/tools/openftlist/) to recommend suitable journals based on the textual content of your [bioRxiv](https://www.biorxiv.org/) or [medRxiv](https://www.medrxiv.org/) preprint.

The tool also provides a "map" of the PubMed Central documents, grouped into bins based on similar textual content, and shows you where your preprint falls on the map.
Select a square to learn more about the papers in that bin.

The map also incorporates a set of 50 [principal components](https://en.wikipedia.org/wiki/Principal_component_analysis) (PCs) generated from bioRxiv.
Each PC represents two high level concepts characterized by keywords of various strengths, illustrated in the word cloud thumbnails above the map.
Select a thumbnail to color the map by that PC.
Deeper orange squares will be papers that correlate more with the orange keywords in the image, and vice versa for blue.

### How does it work?

This tool utilizes two k-nearest neighbor classifiers to recommend journals.
The first classifier is based on individual paper proximities, while the second classifier is based on close proximity to a journal's centroid.
More information on the training and tuning of these classifiers -- and other technical information related to this tool -- can be found in our [manuscript](http://greenelab.github.io/annorxiver_manuscript).
Code for the classifiers can be found [here](http://github.com/greenelab/annorxiver/).
