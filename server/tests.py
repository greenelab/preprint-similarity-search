#!/usr/bin/env python3

"""
Test `get_paper_knn()` function in `find_knn.py` module.

Requires an input `embeddings_filename` argument, which should include
embeddings of papers that are already in the backend's pickled KD-tree.

The first and last data rows of the input file will be read into memory
(with slight changes by rounding), and converted into numpy vectors,
whose closest neighbors will then be searched in the KD-tree.

In both cases, the closest neighbor should be the input paper itself.

Due to hard-coded path of server data, this script can be invoked ONLY
inside its parent directory.
"""

import os
import sys

import numpy as np


def get_first_row():
    """Get the first data row in paper embeddings file."""

    with open(embeddings_filename, 'r') as fh:
        fh.readline() # skip the header line
        first_row = fh.readline()

    return first_row


def get_last_row():
    """Get the last data row in paper embeddings file."""

    with open(embeddings_filename, 'rb') as fh:
        fh.seek(-2, os.SEEK_END)
        while fh.read(1) != b'\n':
            fh.seek(-2, os.SEEK_CUR)

        last_row = fh.readline().decode()

    return last_row


def get_np_vec(data_row):
    """Convert an input data row into a numpy vector."""

    tokens = data_row.strip().split('\t')
    pmc = tokens[1]

    # Use round() to avoid exact match
    vec = [round(float(x), 3) for x in tokens[-300:]]

    # Convert Python list to NumPy array, which is expected by get_paper_knn()
    np_vec = np.array(vec).reshape(1, -1)

    return (pmc, np_vec)


def test_paper_knn(data_row):
    """Confirm the closest neighbor of an input data row."""

    pmc, np_vec = get_np_vec(data_row)
    closest = get_paper_knn(np_vec)[0]

    server_log(
        f"Closest neighbor: {closest['pmcid']}; distance: {closest['distance']}"
    )

    assert closest['pmcid'] == pmc
    assert closest['distance'] < 1e-2  # ensure that distance is small enough
    server_log(f"{pmc} confirmed\n")


# Test harness
if __name__ == "__main__":
    # Enforce correct usage:
    if len(sys.argv) != 2 or sys.argv[0] != './tests.py':
        print(f"Usage: ./tests.py [paper_embeddings_filename]", flush=True)
        sys.exit(1)

    embeddings_filename = sys.argv[1]

    # Import server modules
    from find_knn import get_paper_knn
    from utils import server_log

    # Test first paper
    first_row = get_first_row()
    test_paper_knn(first_row)

    # Test last paper
    last_row = get_last_row()
    test_paper_knn(last_row)
