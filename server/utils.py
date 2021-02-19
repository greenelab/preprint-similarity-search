# Utility functions

import pandas as pd
import pickle
import signal

from datetime import datetime
from flask_restful import abort
from functools import wraps
from sklearn.neighbors import KNeighborsClassifier


def timeout(seconds=120, message="API server timeout"):
    """
    Timeout decorator, based on: https://stackoverflow.com/questions/2281850/
    """

    def decorator(func):
        def _handle_timeout(signum, frame):
            abort(500, message=message)

        def wrapper(*args, **kwargs):
            signal.signal(signal.SIGALRM, _handle_timeout)
            signal.alarm(seconds)
            try:
                result = func(*args, **kwargs)
            finally:
                signal.alarm(0)
            return result

        return wraps(func)(wrapper)

    return decorator


def server_log(message):
    """Print out message with current time at the beginning."""
    print(datetime.now(), message, sep=": ", flush=True)


def create_journal_model(n_neighbors):
    journal_df = pd.read_csv("data/journal_dataset.tsv", sep="\t").set_index("journal")
    journal_model = KNeighborsClassifier(n_neighbors)
    journal_model.fit(
        journal_df.drop("document", axis=1),
        journal_df.reset_index().journal
    )
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
