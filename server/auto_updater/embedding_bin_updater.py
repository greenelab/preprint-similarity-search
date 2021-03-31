import csv
from collections import defaultdict, Counter
import lzma
from pathlib import Path
import pickle
import sys
import time

import numpy as np
import pandas as pd
import rpy2.robjects as robjects
from rpy2.robjects import pandas2ri
from scipy.spatial.distance import cdist
import tqdm

sys.path.append(str(Path("..").resolve()))
from SAUCIE import SAUCIE, Loader


def generate_centroid_dataset(paper_dataset_file, output_file="centroid_dataset.tsv"):
    """
    This function calculates each journal's centroid value
    by grouping each paper embedding by the journal string and calculating
    each group's mean

    Parameters:
        paper_dataset_file - the file that contains all the paper embeddings
        output_file - the file that contains the journal centroids
    """

    journal_centroid = defaultdict(dict)
    if Path(paper_dataset_file).suffix == ".xz":
        infile = lzma.open(paper_dataset_file, "rt")
    else:
        infile = open(paper_dataset_file, "r")

    reader = csv.DictReader(infile, delimiter="\t")

    for line_num, line in tqdm.tqdm(enumerate(reader)):
        if line_num == 0:
            dim = len(line) - 2

        if line["journal"] not in journal_centroid:
            journal_centroid[line["journal"]] = {
                "journal": line["journal"],
                "vector": np.array([float(line[f"feat_{idx}"]) for idx in range(dim)]),
                "counter": 1,
            }

        else:
            journal_centroid[line["journal"]]["counter"] += 1
            journal_centroid[line["journal"]]["vector"] += np.array(
                [float(line[f"feat_{idx}"]) for idx in range(dim)]
            )

    infile.close()

    with open(output_file, "w") as outfile:
        writer = csv.DictWriter(
            outfile,
            fieldnames=["journal"] + [f"feat_{idx}" for idx in range(dim)],
            delimiter="\t",
        )
        writer.writeheader()

        for journal in journal_centroid:
            mean_vec = (
                journal_centroid[journal]["vector"]
                / journal_centroid[journal]["counter"]
            )
            output_dict = {
                f"feat_{idx}": mean_vec[idx] for idx in range(mean_vec.shape[0])
            }
            output_dict["journal"] = journal
            writer.writerow(output_dict)


def generate_SAUCIE_coordinates(
    new_papers, paper_landscape_file, paper_landscape_json_file
):
    """
    This function calculates the SAUCIE coordinates for each paper emebdding
    and then recalculates bins for each newly added paper.

    Parameters:
        new_papers - the file that contains all the paper embeddings
        paper_landscape_file - the file that contains papers mapped to bins
        paper_landscape_json_file - the json file the frontend uses
    """

    new_papers_df = pd.read_csv(new_papers, sep="\t")

    # Load SAUCIE model and generate coordinates for new papers
    saucie_model = SAUCIE(300, restore_folder="../saucie_model")
    coordinates = saucie_model.get_embedding(
        Loader(new_papers_df[[f"feat_{idx}" for idx in range(300)]].values)
    )

    # Activate pandas to r dataframe conversion
    pandas2ri.activate()

    # Grab the SAUCIE updated coordinates
    landscape_df = pd.read_csv(f"{paper_landscape_file}", sep="\t").append(
        pd.DataFrame(coordinates, columns=["dim1", "dim2"]).assign(
            document=new_papers_df.document.tolist(),
            journal=new_papers_df.journal.tolist(),
        )[["dim1", "dim2", "journal", "document"]],
        sort=True,
    )

    # Bin the data into squares
    robjects.globalenv["data_df"] = robjects.conversion.py2rpy(landscape_df)
    robjects.r.source("get_square_bins.R")
    square_bin_plot_df = robjects.conversion.rpy2py(
        robjects.globalenv["square_plot_df"]
    )

    # Iterate through the squares and assign bin_id to data
    square_iterator = enumerate(square_bin_plot_df.iterrows())
    mapped_data_df = pd.DataFrame([], columns=landscape_df.columns.tolist())

    for idx, (row_idx, square_bin) in tqdm.tqdm(square_iterator):

        top_left = (square_bin["xmin"], square_bin["ymax"])
        bottom_right = (square_bin["xmax"], square_bin["ymin"])

        datapoints_df = landscape_df.query(
            f"dim1 > {top_left[0]} and dim1 < {bottom_right[0]}"
        ).query(f"dim2 < {top_left[1]} and dim2 > {bottom_right[1]}")

        mapped_data_df = mapped_data_df.append(
            datapoints_df.assign(squarebin_id=idx).reset_index(drop=True),
            ignore_index=True,
            sort=True,
        )

    # Write updated file to disk
    mapped_data_df.to_csv(paper_landscape_file, sep="\t", index=False)

    # Write updated bin plot to disk
    (
        square_bin_plot_df.assign(bin_id=mapped_data_df.squarebin_id.unique().shape[0])[
            ["x", "y", "xmin", "xmax", "ymin", "ymax", "bin_id"]
        ].to_json(paper_landscape_json_file, orient="records", lines=False)
    )


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


def get_odds_ratio(bin_dict, background_dict, background_sum, bin_sum, cutoff_score=20):
    """
    This function calculates the odds ratio between
    tokens within each bin and background token distribution.
    Reports the log odds ratio for each bin.

    Parameters:
        bin_dict - the dictionary containing tokens within a given bin and their respective counts
        background_dict - the dictionary containing tokens and their respective counts
        background_sum - total number of tokens
        bin_sum - total number of tokens in a given bin
        cutoff_score - a threshold to remove tokens
    """
    # Try and filter out low count tokens to speed function up
    filtered_bin_dict = {
        lemma: bin_dict[lemma] for lemma in bin_dict if bin_dict[lemma] > cutoff_score
    }

    if len(filtered_bin_dict) > 0:
        bin_dict = filtered_bin_dict

    # Calculate odds ratio
    bin_words = set(bin_dict.keys())
    background_words = set(background_dict.keys())
    words_to_compute = bin_words & background_words

    word_odd_ratio_records = []
    for idx, word in enumerate(words_to_compute):
        top = float(bin_dict[word] * background_sum)
        bottom = float(background_dict[word] * bin_sum)
        word_odd_ratio_records.append(
            {"lemma": word, "odds_ratio": np.log(top / bottom)}
        )

    return word_odd_ratio_records


def update_paper_bins_stats(
    word_bin_dict,
    background_dict,
    paper_embeddings_file,
    pca_axes_file,
    paper_landscape_json_file,
):
    """
    This function performs all the updates necessary for the frontend to work.
    It cycles through each bin and first calculates the cosine similarity between the bin
    and each PC. Next it calculates the odds ratio for each bin given the background.
    Lastly, it writes out all calculated statistics into a json file for the front end to use.

    Parameters:
        word_bin_dict - the dicionary containing token counts for word bins
        background_dict - the dictionary containing token counts for all papers
        paper_embeddings_file - the file that contains papers and their respective embeddings
        pca_axes_file- the file containing the PC axes
        paper_landscape_json_file - the file containing the json file the front end uses
    """

    # Grab the PCA axes and Word counts
    # PCA
    pca_axes_df = pd.read_csv(pca_axes_file, sep="\t")

    # Read embeddings into dictionary
    bin_centroid = defaultdict(dict)
    if Path(paper_embeddings_file).suffix == ".xz":
        infile = lzma.open(paper_embeddings_file, "rt")
    else:
        infile = open(paper_embeddings_file, "r")

    reader = csv.DictReader(infile, delimiter="\t")

    for line_num, line in tqdm.tqdm(enumerate(reader)):
        if line_num == 0:
            dim = len(line) - 2

        bin_key = doc_bin_mapper[line["document"]]
        if bin_key not in bin_centroid:
            bin_centroid[bin_key] = {
                "vector": np.array([float(line[f"feat_{idx}"]) for idx in range(dim)]),
                "counter": 1,
                "journal": Counter([line["journal"]]),
            }

        else:
            bin_centroid[bin_key]["counter"] += 1
            bin_centroid[bin_key]["vector"] += np.array(
                [float(line[f"feat_{idx}"]) for idx in range(dim)]
            )
            bin_centroid[bin_key]["journal"].update(Counter([line["journal"]]))

    infile.close()

    # Word Counts
    background_sum = np.sum(list(background_dict.values()))

    # data records
    bin_stat_records = []

    # Iterate through each bin
    for squarebin_id in tqdm.tqdm(word_bin_dict):

        # Calculate bin token odds
        bin_sum = np.sum(list(word_bin_dict[squarebin_id].values()))
        word_odds_ratios = get_odds_ratio(
            word_bin_dict[squarebin_id], background_dict, background_sum, bin_sum
        )
        word_odds_ratios = sorted(
            word_odds_ratios, key=lambda x: x["odds_ratio"], reverse=True
        )

        # Calculate pca enrichment
        bin_vector = (
            bin_centroid[squarebin_id]["vector"] / bin_centroid[squarebin_id]["counter"]
        )
        pca_sim_df = get_pca_sim([bin_vector], pca_axes_df.values)

        # Write stats as records
        bin_stat_records.append(
            {
                "bin_id": squarebin_id,
                "pc": pca_sim_df.to_dict(orient="records"),
                "count": bin_centroid[squarebin_id]["counter"],
                "journal": dict(bin_centroid[squarebin_id]["journal"].items()),
                "bin_odds": word_odds_ratios[:20],
            }
        )

    # Write updated file to disk
    square_plot_df = pd.read_json(paper_landscape_json_file)
    (
        square_plot_df.merge(pd.DataFrame.from_records(bin_stat_records), on="bin_id")
        .reset_index(drop=True)
        .to_json(paper_landscape_json_file, orient="records", lines=False)
    )
