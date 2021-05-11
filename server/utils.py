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


def get_journal_model(n_neighbors):
    journal_df = pd.read_csv("data/journals.tsv", sep="\t").set_index("journal")
    journal_model = KNeighborsClassifier(n_neighbors)
    journal_model.fit(
        journal_df.drop("document", axis=1),
        journal_df.reset_index().journal
    )

    return (journal_df, journal_model)


def get_paper_model(n_neighbors):
    """Build and return the paper model based on pickled kd-tree."""

    print("", flush=True)  # add a blank line before log section
    server_log("Start initializing paper models")

    pkl_filename = "data/kd_tree.pkl"
    with open(pkl_filename, "rb") as fh:
        kd_tree = pickle.load(fh)

    paper_model = KNeighborsClassifier(n_neighbors)
    paper_model.n_samples_fit_ = len(kd_tree.idx_array)
    paper_model.effective_metric_ = "euclidean"
    paper_model._fit_method = 'kd_tree'
    paper_model._tree = kd_tree

    server_log("Finished loading paper models\n")

    return paper_model


def get_pmc_map():
    pkl_filename = "data/pmc_map.pkl"
    with open(pkl_filename, "rb") as fh:
        pmc_map = pickle.load(fh)

    return pmc_map
