#!/usr/bin/env python3

# Generate SAUCIE coordinates

from pathlib import Path
import sys

import pandas as pd
import rpy2.robjects as robjects
from rpy2.robjects import pandas2ri

server_path = Path("../server").resolve()
sys.path.append(str(server_path)) # make SAUCIE package importable
from SAUCIE import SAUCIE, Loader


def generate_saucie_coordinates(
        new_embeddings_filename,
        old_pmc_tsne_filename,
        updated_pmc_tsne_filename,
        tmp_plot_json_filename,
):
    """
    This function calculates the SAUCIE coordinates for each paper emebdding
    and then recalculates bins for each newly added paper.

    Parameters:
      * new_embeddings_filename: input file that contains embeddings of new papers
      * old_pmc_tsne_filename: input file that contains original paper-bin mapping
      * updated_pmc_tsne_filename: output file with updated paper-bin mapping
      * tmp_plot_json_filename: intermediate output JSON file with updated pmc landscape
    """

    new_papers_df = pd.read_csv(new_embeddings_filename, sep="\t")

    # Load SAUCIE model and generate coordinates for new papers
    saucie_model = SAUCIE(300, restore_folder="../server/saucie_model")
    coordinates = saucie_model.get_embedding(
        Loader(new_papers_df[[f"feat_{idx}" for idx in range(300)]].values)
    )

    # Activate pandas to R dataframe conversion
    pandas2ri.activate()

    # Grab the SAUCIE updated coordinates
    landscape_df = pd.read_csv(
        old_pmc_tsne_filename,
        sep="\t"
    ).append(
        pd.DataFrame(
            coordinates,
            columns=["dim1", "dim2"]
        ).assign(
            document=new_papers_df.document.tolist(),
            journal=new_papers_df.journal.tolist(),
        )[
            ["dim1", "dim2", "journal", "document"]
        ],
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

    # Arrange columns in a fixed order:
    cols = ['dim1', 'dim2', 'journal', 'document', 'squarebin_id']
    mapped_data_df = mapped_data_df[cols]

    # Write updated pmc tsne file to disk
    mapped_data_df.to_csv(updated_pmc_tsne_filename, sep="\t", index=False)

    # Write plot file to disk in JSON format
    square_bin_plot_df.assign(
        bin_id=mapped_data_df.squarebin_id.unique().tolist()
    )[
        ["x", "y", "xmin", "xmax", "ymin", "ymax", "bin_id"]
    ].to_json(
        tmp_plot_json_filename,
        orient="records",
        lines=False
    )

    # Set output files read-only
    set_read_only(updated_pmc_tsne_filename)
    set_read_only(tmp_plot_json_filename)


# Test harness
if __name__ == "__main__":
    # Input files
    new_embeddings_filename = "./data/current_run/output/new_papers/embeddings.tsv"
    old_pmc_tsne_filename = "./data/current_run/input/pmc_tsne_square.tsv"

    # Output files
    updated_pmc_tsne_filename = "./data/current_run/output/pmc_tsne_square.tsv"
    tmp_plot_json_filename = "./data/current_run/output/pmc_plot_tmp.json"

    generate_saucie_coordinates(
        new_embeddings_filename,
        old_pmc_tsne_filename,
        updated_pmc_tsne_filename,
        tmp_plot_json_filename
    )
