This web app is designed to recommend suitable journal endpoints based on the textual content of a preprint.
This app recommends journals by utilizing two k-nearest neighbor classifiers. 
The first classifier is based on individual paper proximities, while the second classifier is based on close proximity to a journal's centroid.
More information on the training and tuning of these classifiers can be found in our [manuscript](http://greenelab.github.io/annorxiver_manuscript).
Code for the classifiers can be found [here](http://github.com/greenelab/annorxiver/).
**Important Note**: this app requires a preprint to be hosted on [bioRxiv](http://biorxiv.org)'s server before it can be processed.