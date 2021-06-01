#!/usr/bin/env python3

# Generate journal centroid dataset

import csv
from pathlib import Path

import numpy as np

from utils import set_read_only


def generate_journal_centroid(paper_embeddings_filename, output_filename):
    """
    This function calculates each journal's centroid value
    by grouping each paper embedding by the journal string and calculating
    each group's mean

    Parameters:
      * paper_embeddings_filename: input file that contains all the paper
        embeddings
      * output_filename - output file that contains the journal centroids
    """

    journal_centroid = dict()

    # Read input paper embeddings file
    with open(paper_embeddings_filename, "r") as ifh:
        reader = csv.DictReader(ifh, delimiter="\t")
        for line_num, line in enumerate(reader):
            if line_num == 0:
                dim = len(line) - 2

            if line["journal"] not in journal_centroid:
                journal_centroid[line["journal"]] = {
                    "journal": line["journal"],
                    "document": line["document"],
                    "vector": np.array([float(line[f"feat_{idx}"]) for idx in range(dim)]),
                    "counter": 1,
                }
            else:
                journal_centroid[line["journal"]]["counter"] += 1
                journal_centroid[line["journal"]]["vector"] += np.array(
                    [float(line[f"feat_{idx}"]) for idx in range(dim)]
                )

    # Write output file
    with open(output_filename, "w") as outfile:
        writer = csv.DictWriter(
            outfile,
            fieldnames=["journal", "document"] + [f"feat_{idx}" for idx in range(dim)],
            delimiter="\t",
        )
        writer.writeheader()

        for journal in journal_centroid:
            mean_vec = journal_centroid[journal]["vector"] / journal_centroid[journal]["counter"]
            output_dict = {
                f"feat_{idx}": mean_vec[idx] for idx in range(mean_vec.shape[0])
            }
            output_dict["journal"] = journal
            output_dict["document"] = journal_centroid[journal]["document"]
            writer.writerow(output_dict)

    # Set output file read-only
    set_read_only(output_filename)


# Test harness
if __name__ == "__main__":
    data_dir = "./data/current_run/output/"
    paper_embeddings_filename = data_dir + "embeddings_full.tsv"
    output_filename = data_dir + "journals.tsv"

    generate_journal_centroid(paper_embeddings_filename, output_filename)
