from collections import defaultdict, Counter
import lzma
from pathlib import Path
import pickle
import sys

import numpy as np
import pandas as pd
import rpy2.robjects as robjects
from rpy2.robjects import pandas2ri
from scipy.spatial.distance import cdist
import tqdm

sys.path.append(str(Path("..").resolve()))
from SAUCIE import SAUCIE, Loader


def generate_centroid_dataset(paper_dataset_file):
    """
    This function calculates each journal's centroid value
    by grouping each paper embedding by the journal string and calculating
    each group's mean

    Parameters:
        paper_dataset_file - the file that contains all the paper embeddings
    """

    (
        pd.read_csv(paper_dataset_file, sep="\t")
        .groupby("journal")
        .agg("mean")
        .reset_index()
        .to_csv("centroid.tsv", index=False, sep="\t")
    )


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
    (mapped_data_df.to_csv(paper_landscape_file, sep="\t", index=False))

    # Write updated bin plot to disk
    (
        square_bin_plot_df.assign(bin_id=mapped_data_df.squarebin_id.unique().shape[0])[
            ["x", "y", "xmin", "xmax", "ymin", "ymax", "bin_id"]
        ].to_json("pmc_square_plot.json", orient="records", lines=False)
    )


def get_pca_sim(landscape_df, pca_axes_df):
    """
    This function calculates the cosine similarity between
    papers within each bin and the 50 principal components generated via PCA.

    Parameters:
        landscape_df - the dataframe containing the paper embeddings within each bin
        pca_axes_df - the dataframe containing the 50 principal component axes
    """

    bin_pca_dist = 1 - cdist(
        pca_axes_df.values,
        (
            landscape_df.drop(["journal", "document"], axis=1)
            .mean(axis=0)
            .values[:, np.newaxis]
            .T
        ),
        "cosine",
    )

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


def get_odds_ratio(bin_dict, background_dict):
    """
    This function calculates the odds ratio between
    tokens within each bin and background token distribution.
    Reports the log odds ratio for each bin.

    Parameters:
        bin_dict - the dictionary containing tokens within a given bin and their respective counts
        background_dict - the dictionary containing tokens and their respective counts
    """

    bin_words = set(bin_dict.keys())
    background_words = set(background_dict.keys())
    words_to_compute = bin_words & background_words

    bin_sum = np.sum(list(bin_dict.values()))
    background_sum = np.sum(list(background_dict.values()))

    word_odd_ratio_records = []
    for idx, word in enumerate(words_to_compute):
        top = float(bin_dict[word] * background_sum)
        bottom = float(background_dict[word] * bin_sum)
        word_odd_ratio_records.append(
            {"lemma": word, "odds_ratio": np.log(top / bottom)}
        )

    return pd.DataFrame.from_records(word_odd_ratio_records)


def update_paper_bins_stats(
    paper_landscape_file,
    paper_embeddings_file,
    global_word_counter_file,
    pca_axes_file,
    paper_landscape_json_file,
):
    """
    This function performs all the updates necessary for the frontend to work.
    It cycles through each bin and first calculates the cosine similarity between the bin
    and each PC. Next it calculates the odds ratio for each bin given the background.
    Lastly, it writes out all calculated statistics into a json file for the front end to use.

    Parameters:
        paper_landscape_file - the file that contains papers mapped to bins
        paper_embeddings_file - the file that contains papers and their respective embeddings
        global_word_counter_file - the background pickle file
        pca_axes_file- the file containing the PC axes
        paper_landscape_json_file - the file containing the json file the front end uses
    """

    # Grab the PCA axes and Word counts
    # PCA
    pca_axes_df = pd.read_csv(pca_axes_file, sep="\t")
    landscape_df = pd.read_csv(f"{paper_landscape_file}", sep="\t")
    embeddings_df = pd.read_csv(f"{paper_embeddings_file}", sep="\t")

    # Word Counts
    background_dict = pickle.load(open(global_word_counter_file, "rb"))

    # data records
    bin_stat_records = []

    # Iterate through each bin
    bin_iterator = landscape_df.squarebin_id.unique().tolist()
    max_num = len(str(max(bin_iterator)))
    for squarebin_id in tqdm.tqdm(bin_iterator):
        documents = landscape_df.query(
            f"squarebin_id == {squarebin_id}"
        ).document.tolist()

        square_bin_df = embeddings_df.query(f"document in {documents}")
        pca_sim_df = get_pca_sim(square_bin_df, pca_axes_df)

        bin_num_str = "0" * (max_num - len(str(squarebin_id)))
        bin_count_dict = pickle.load(
            open(
                "bin_counters/" f"word_bin_{bin_num_str+str(squarebin_id)}_count.pkl",
                "rb",
            )
        )

        word_odds_ratios = (
            get_odds_ratio(
                bin_count_dict,
                background_dict,
            )
            .sort_values("odds_ratio", ascending=False)
            .head(20)
        )

        bin_stat_records.append(
            {
                "bin_id": squarebin_id,
                "pc": pca_sim_df.to_dict(orient="records"),
                "count": landscape_df.shape[0],
                "journal": dict(Counter(landscape_df.journal.tolist()).items()),
                "bin_odds": [
                    dict(lemma=pair[0], odds=pair[1])
                    for pair in zip(word_odds_ratios.lemma, word_odds_ratios.odds_ratio)
                ],
            }
        )

    # Write updated file to disk
    square_plot_df = pd.read_json(paper_landscape_json_file)
    (
        square_plot_df.merge(pd.DataFrame.from_records(bin_stat_records), on="bin_id")
        .reset_index(drop=True)
        .to_json(paper_landscape_json_file, orient="records", lines=False)
    )
