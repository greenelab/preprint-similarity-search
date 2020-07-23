# Utility functions

import pandas as pd
import pickle
from datetime import datetime
from sklearn.neighbors import KNeighborsClassifier


def server_log(message):
    """Print out message with current time at the beginning."""
    print(datetime.now(), message, sep=": ", flush=True)


def create_journal_model(n_neighbors):
    journal_df = pd.read_csv("data/journal_dataset.tsv", sep="\t").set_index("journal")
    journal_model = KNeighborsClassifier(n_neighbors)
    journal_model.fit(journal_df.values, journal_df.reset_index().journal)
    return (journal_df, journal_model)


def create_paper_models(n_neighbors):
    """Return a list of paper models based on pickled sub-kd-trees."""

    print('', flush=True)  # add a blank line before log section
    server_log("Start initializing paper models")

    N_PAPER_MODELS = 4         # number of sub-models for paper dataset
    PAPER_MODEL_SIZE = 431539  # number of nodes in each sub-model
    paper_models = list()
    for id in range(1, N_PAPER_MODELS + 1):
        pkl_filename = f"data/paper_dataset/sub{id}.pkl"
        sub_model = KNeighborsClassifier(n_neighbors)
        sub_model.n_samples_fit_ = PAPER_MODEL_SIZE
        sub_model.effective_metric_ = 'euclidean'
        sub_model._fit_method = 'kd_tree'
        sub_model._tree = pickle.load(open(pkl_filename, "rb"))
        paper_models.append(sub_model)

    server_log("Finished loading paper models\n")
    return paper_models
