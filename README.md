# AnnoRxiver Journal Recommender

Enter a BioRxiv preprint and get a list of journals that would be most suited to publish your paper.
Available as a web app and a server.

[⭐ OPEN THE APP ⭐](https://greenelab.github.io/annorxiver-journal-recommender/)

### What does this do?

This tool uses a machine learning model trained on 1.7 million [Pubmed Central](https://www.ncbi.nlm.nih.gov/pmc/) documents to recommend suitable journals based on the textual content of your [bioRxiv](https://www.biorxiv.org/) preprint.

### How does it work?

This tool utilizes two k-nearest neighbor classifiers to recommend journals.
The first classifier is based on individual paper proximities, while the second classifier is based on close proximity to a journal's centroid.
More information on the training and tuning of these classifiers can be found in our [manuscript](http://greenelab.github.io/annorxiver_manuscript).
Code for the classifiers can be found [here](http://github.com/greenelab/annorxiver/).
