#!/usr/bin/env python3

"""
Update PMC square bins and create plot JSON file.
"""

import csv
import os
import pickle
from collections import defaultdict, Counter
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.spatial.distance import cdist

from utils import set_read_only, updater_log


def get_bin_centroid(embeddings_filename, pmc_bin_mapper):
    """Get centroid for each bin."""

    bin_centroid = dict()

    with open(embeddings_filename) as ifh:
        reader = csv.DictReader(ifh, delimiter="\t")
        for line_num, line in enumerate(reader):
            if line_num == 0:
                dim = len(line) - 2

            bin_key = pmc_bin_mapper[line["document"]]
            if bin_key not in bin_centroid:
                bin_centroid[bin_key] = {
                    "vector": np.array(
                        [float(line[f"feat_{idx}"]) for idx in range(dim)]
                    ),
                    "counter": 1,
                    "journal": Counter([line["journal"]]),
                }
            else:
                bin_centroid[bin_key]["counter"] += 1
                bin_centroid[bin_key]["vector"] += np.array(
                    [float(line[f"feat_{idx}"]) for idx in range(dim)]
                )
                bin_centroid[bin_key]["journal"].update(
                    Counter([line["journal"]])
                )

    return bin_centroid


def get_pca_sim(landscape_vector, pca_axes):
    """
    This function calculates the cosine similarity between
    papers within each bin and the 50 principal components generated via PCA.

    Parameters:
        landscape_vector - the vector containing the paper embeddings within each bin
        pca_axes - the matrix containing the 50 principal component axes
    """

    bin_pca_dist = 1 - cdist(pca_axes, landscape_vector, "cosine")

    pca_sim_df = pd.DataFrame(
        {
            "score": bin_pca_dist[:, 0],
            "pc": [f"0{dim+1}" if dim + 1 < 10 else f"{dim+1}" for dim in range(50)],
        }
    )

    pca_sim_df = pca_sim_df.reindex(
        pca_sim_df.score.abs().sort_values(ascending=False).index
    )

    return pca_sim_df


def get_odds_ratio(bin_data, total_counts, total_sum):
    """
    This function calculates the odds ratio between tokens within each
    bin and background token distribution and reports the log odds ratio
    for each bin.

    Parameters:
      * bin_data: dict that contains tokens and counts in the current bin;
      * total_counts: dict that contains all tokens and counts;
      * total_sum: total number of tokens;
      * cutoff_score: a threshold to remove tokens.
    """

    bin_sum = sum(bin_data.values())

    # Calculate odds ratio
    bin_words = set(bin_data.keys())
    word_odd_ratio_records = []
    for idx, word in enumerate(bin_words):
        top = float(bin_data[word] * total_sum)
        bottom = float(total_counts[word] * bin_sum)
        word_odd_ratio_records.append(
            {
                "lemma": word,
                "odds_ratio": np.log(top / bottom)
            }
        )

    return word_odd_ratio_records


def process_bin(
        bin_id, bin_data, centroid_data,
        total_counts, total_sum, pca_axes_df
):
    """Process a single square bin."""

    word_odds_ratios = get_odds_ratio(bin_data, total_counts, total_sum)

    word_odds_ratios = sorted(
        word_odds_ratios,
        key=lambda x: x['odds_ratio'],
        reverse=True
    )

    # Calculate pca enrichment
    bin_vector = centroid_data["vector"] / centroid_data["counter"]
    pca_sim_df = get_pca_sim([bin_vector], pca_axes_df.values)

    result = {
        "bin_id": bin_id,
        "pc": pca_sim_df.to_dict(orient="records"),
        "count": centroid_data["counter"],
        "journal": dict(centroid_data["journal"].items()),
        "bin_odds": word_odds_ratios[:20]
    }

    # dhu test: Write output to pickle file:
    with open(f'output/bin_counters/{bin_id}.pkl', 'wb') as fh:
        pickle.dump(result, fh)

    return result


def update_paper_bins_stats(
        pmc_tsne_filename,
        embeddings_filename,
        token_counts_filename,
        pca_axes_filename,
        tmp_json_filename,
        final_json_filename,
        cutoff_score=20
):
    """
    This function performs all the updates necessary for the frontend to
    work. It cycles through each bin and first calculates the cosine
    similarity between the bin and each PC.  Next it calculates the odds
    ratio for each bin given the background.  Lastly, it writes out all
    calculated statistics into a json file for the front end to use.

    Parameters:
      * pmc_tsne_filename: name of file that contains bin ID a paper is
        assigned to;
      * embeddings_filename: name of file that contains papers and their
        respective embeddings;
      * token_counts_filename: name of file that contains global token
        counters;
      * pca_axes_filename: name of file that contains the PC axes;
      * tmp_json_filename: input intermediate json filename;
      * final_json_filename: final output json filename (for front end);
      * cutoff_score: a threshold to remove tokens.

    """

    # Read input paper landscape file and create a map from paper ID to bin_id
    all_paper_bins = pd.read_csv(pmc_tsne_filename, sep="\t")
    pmc_bin_mapper = dict(
        zip(
            all_paper_bins["document"].tolist(),
            all_paper_bins["squarebin_id"].tolist()
        )
    )

    # Read embeddings into dictionary
    updater_log(f"Reading {embeddings_filename} (8~9 minutes) ...")
    bin_centroid = get_bin_centroid(embeddings_filename, pmc_bin_mapper)

    # Read global word counter file to get word counts in each bin:
    bin_counts = [
        Counter()
        for bin_id in all_paper_bins["squarebin_id"].unique()
    ]

    updater_log(f"Reading {token_counts_filename} (~2.5 hours) ...")
    with open(token_counts_filename) as ifh:
        count_reader = csv.DictReader(ifh, delimiter="\t")
        for line in count_reader:
            token_count_entry = {line["lemma"]: int(line["count"])}
            bin_id = pmc_bin_mapper[line["document"]]
            bin_counts[bin_id].update(token_count_entry)

    # Filter each bin in `bin_counts` and calculate `total_counts` by getting
    # the sum of all bins in `bin_counts`.
    updater_log(f"Filtering bins and getting the total counts ...")
    total_counts = Counter()
    for bin_id, bin_data in enumerate(bin_counts):
        # Filter out low count tokens to speed function up
        filtered_bin_data = {
            lemma: counts
            for lemma, counts in bin_data.items() if counts > cutoff_score
        }

        if len(filtered_bin_data) > 0:
            bin_data = filtered_bin_data
            bin_counts[bin_id] = bin_data

        total_counts += bin_data

    # Get sum of background word counts
    total_sum = sum(total_counts.values())

    # Grab the PCA axes
    pca_axes_df = pd.read_csv(pca_axes_filename, sep="\t")

    # Process all bins
    updater_log("Processing all square bins ...")
    bin_stat_records = list()
    for bin_id, bin_data in enumerate(bin_counts):
        bin_stat_records.append(
            process_bin(
                bin_id, bin_data, bin_centroid[bin_id],
                total_counts, total_sum, pca_axes_df
            )
        )

    # Update JSON file and write it to disk
    square_plot_df = pd.read_json(tmp_json_filename)

    square_plot_df.merge(
        pd.DataFrame.from_records(bin_stat_records), on="bin_id"
    ).reset_index(
        drop=True
    ).to_json(
        final_json_filename, orient="records", lines=False
    )

    # Set final output json file read-only
    set_read_only(final_json_filename)


# Test harness
if __name__ == "__main__":
    # Input files
    pmc_tsne_filename = './data/current_run/output/pmc_tsne_square.tsv'
    embeddings_filename = "./data/current_run/output/embeddings_full.tsv"
    token_counts_filename = './data/current_run/output/global_token_counts.tsv'
    pca_axes_filename = "./data/static/pca_components.tsv"
    tmp_json_filename = "./data/currnet_run/output/pmc_plot_tmp.json"

    # output file
    final_json_filename = "./data/current_run/output/pmc_plot_final.json"

    updater_log("Start ...")

    update_paper_bins_stats(
        pmc_tsne_filename,
        embeddings_filename,
        token_counts_filename,
        pca_axes_filename,
        tmp_json_filename,
        final_json_filename
    )
