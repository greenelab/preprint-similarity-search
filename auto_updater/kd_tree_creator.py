#!/usr/bin/env python3

"""
Create pickle kdtree related files for backend server use.
"""

import pickle
from pathlib import Path

import pandas as pd
from sklearn.neighbors import KNeighborsClassifier

from utils import set_read_only, updater_log


def pickle_kd_tree(dataset_filename, pmc_pkl_filename, kdtree_pkl_filename):
    """
    Main function.  Times wrer measured on a "e2-high-mem-8" Google
    Compute Engine instance (64-GB RAM).
    """

    # Read paper_dataset file: 3.3 minutes
    updater_log(f"Reading {dataset_filename} ...")
    df = pd.read_csv(dataset_filename, sep="\t").set_index("document")

    # Create pmc_map.pkl: immediately
    pmc_list = df.index.tolist()
    pmc_map = {row_num: pmc for row_num, pmc in enumerate(pmc_list)}
    updater_log("Pickle pmc_map ...")
    with open(pmc_pkl_filename, "wb") as fh:
        pickle.dump(pmc_map, fh)

    # Create KNN paper_model: 7.5 minutes (~32 GB RAM required)
    updater_log("Start KNN fitting")
    paper_model = KNeighborsClassifier(n_neighbors=10)
    paper_model.fit(df.drop("journal", axis=1), df.journal)

    # Pickle kd-tree: 28 seconds
    updater_log("Pickle kd_tree component ...")
    kd_tree = paper_model._tree
    with open(kdtree_pkl_filename, "wb") as fh:
        pickle.dump(kd_tree, fh)

    updater_log("kd_tree pickled")

    # Set output files read-only
    set_read_only(pmc_pkl_filename)
    set_read_only(kdtree_pkl_filename)


# Test harness
if __name__ == "__main__":
    data_dir = './data/current_run/output/'

    # Input file
    dataset_filename = Path(data_dir, 'embeddings_full.tsv')

    # Output files
    pmc_pkl_filename = Path(data_dir, 'deployment', 'pmc_map.pkl')
    kdtree_pkl_filename = Path(data_dir, 'deployment', 'kd_tree.pkl')

    pickle_kd_tree(dataset_filename, pmc_pkl_filename, kdtree_pkl_filename)
