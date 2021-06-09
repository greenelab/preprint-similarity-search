#!/usr/bin/env python3

"""
Main Python module that starts the auto-updater pipeline.
"""

import os
import sys
from pathlib import Path

from bin_stats_updater import update_paper_bins_stats
from downloader import download_xml_files
from json_minimizer import minimize_json
from journal_centroid import generate_journal_centroid
from kd_tree_creator import pickle_kd_tree
from merger import merge_files
from paper_parser import parse_new_papers
from saucie_coordinates import generate_saucie_coordinates
from utils import updater_log


# Main program
if __name__ == "__main__":
    updater_log("Python auto-updater pipeline started")

    # Get name of the directory that this script is located:
    parent_dir = Path(__file__).resolve().parent

    # Static data dir
    static_data_dir = Path(parent_dir, 'data', 'static')

    # Static data files that will be read by each updater run
    pca_axes_filename = Path(static_data_dir, 'pca_components.tsv')
    word_model_vector_filename = Path(static_data_dir, 'word_model.wv.pkl')

    # Input/output data directory for current run
    current_data_dir = Path(parent_dir, 'data', 'current_run')

    # Input dir
    input_dir = Path(current_data_dir, 'input')

    # Output dir: If not exist yet, create it
    output_dir = Path(current_data_dir, 'output')
    os.makedirs(output_dir, exist_ok=True)

    # Deployment dir: sub-directory for output files that will be
    # directly used by the backend server.
    deployment_dir = Path(output_dir, 'deployment')
    os.makedirs(deployment_dir, exist_ok=True)

    #===================================================================
    #                    Run the pipeline
    #===================================================================

    # (1) Download XML tarball files
    # ------------------------------------------------------------------

    # Output dir where the downloaded files will be saved in
    download_dir = Path(output_dir, 'downloaded_files')
    os.makedirs(download_dir, exist_ok=True)  # If not exist yet, create it

    download_xml_files(download_dir)
    updater_log("NCBI tarball files downloaded\n")


    # (2) Find new papers in downloaded files and process them
    # ------------------------------------------------------------------
    updater_log("Find and parse new papers ...")

    # Input file: pmc list in last run
    prev_pmc_list_filename = Path(input_dir, 'pmc_oa_file_list.tsv')

    # Output dir for new papers
    new_papers_dir = Path(output_dir, 'new_papers')
    os.makedirs(new_papers_dir, exist_ok=True)  # If not exist yet, create it

    # Output files for new papers
    new_pmc_list_basename = 'pmc_list.tsv'
    new_embeddings_basename = 'embeddings.tsv'
    new_token_counts_basename = 'token_counts.tsv'

    # Number of concurrent processes launched to process new papers
    parallel = 6

    num_new_papers = parse_new_papers(
        download_dir,
        prev_pmc_list_filename,
        word_model_vector_filename,
        new_papers_dir,
        new_pmc_list_basename,
        new_embeddings_basename,
        new_token_counts_basename,
        parallel=parallel
    )

    # Terminate the whole program if new papers are not found.
    # If `run.bash` is the caller, it will be also terminated due to
    # `sys.exit(1)` here and `set -e` in `run.bash`.
    if num_new_papers == 0:
        updater_log(f"No new papers found, exit\n")
        sys.exit(1)

    updater_log(f"{num_new_papers:,} new papers found and parsed\n")


    # (3) Merge new papers with last run
    # ------------------------------------------------------------------
    # Input files: embeddings and global token counts files in last run
    prev_embeddings_filename = Path(input_dir, 'embeddings_full.tsv')
    prev_token_counts_filename = Path(input_dir,'global_token_counts.tsv')

    # Full path of new papers data files generated in previous step:
    new_pmc_list_filename = Path(new_papers_dir, new_pmc_list_basename)
    new_embeddings_filename = Path(new_papers_dir, new_embeddings_basename)
    new_token_counts_filename = Path(new_papers_dir, new_token_counts_basename)

    # Output files: merged data of both previous and new papers
    merged_pmc_list_filename = Path(output_dir, 'pmc_oa_file_list.tsv')
    merged_embeddings_filename = Path(output_dir, 'embeddings_full.tsv')
    merged_token_counts_filename = Path(output_dir, 'global_token_counts.tsv')

    merge_files(
        prev_pmc_list_filename,
        prev_embeddings_filename,
        prev_token_counts_filename,
        new_pmc_list_filename,
        new_embeddings_filename,
        new_token_counts_filename,
        merged_pmc_list_filename,
        merged_embeddings_filename,
        merged_token_counts_filename
    )

    updater_log(f"{num_new_papers:,} new papers merged with last run\n")


    # (4) Create new journal centroid based on merged data
    # ------------------------------------------------------------------
    updater_log("Create journal centroid file ...")

    # One output file that will be saved in `deployment_dir`:
    journal_centroid_filename = Path(deployment_dir, 'journals.tsv')

    generate_journal_centroid(
        merged_embeddings_filename,
        journal_centroid_filename
    )

    updater_log("Journal centroid file created\n")


    # (5) Update saucie coordinates and PMC sqaure bins
    # --------------------------------------------------------------------
    updater_log("Updating SAUCIE coordinates and square bins ...")

    # Input file: paper tsne file in last run
    old_pmc_tsne_filename = Path(input_dir, 'pmc_tsne_square.tsv')

    # Output files: PMC tsne file and intermediate PMC plot json file
    updated_pmc_tsne_filename = Path(output_dir, 'pmc_tsne_square.tsv')
    tmp_plot_filename = Path(output_dir, 'pmc_plot_tmp.json')

    generate_saucie_coordinates(
        new_embeddings_filename,
        old_pmc_tsne_filename,
        updated_pmc_tsne_filename,
        tmp_plot_filename
    )

    updater_log("SAUCIE coordinates and square bins updated\n")


    # (6) Update PMC bin stats and final plot json file
    # ------------------------------------------------------------------
    updater_log("Updating PMC plot json file ...")

    # Output file: final PMC plot JSON file
    final_plot_filename = Path(output_dir, 'pmc_plot_final.json')

    update_paper_bins_stats(
        updated_pmc_tsne_filename,
        merged_embeddings_filename,
        merged_token_counts_filename,
        pca_axes_filename,
        tmp_plot_filename,
        final_plot_filename
    )

    updater_log("PMC plot json file updated\n")


    # (7) Minimize plot JSON file for frontend
    # ------------------------------------------------------------------
    updater_log("Creating minimized plot json file ...")

    # One output file that will be saved in `deployment_dir`:
    mini_plot_filename = Path(deployment_dir, 'plot.json')

    minimize_json(final_plot_filename, mini_plot_filename)

    updater_log("Minimized json plot file created\n")


    # (8) Create kdtree-related pickle files for backend
    # ------------------------------------------------------------------
    updater_log("Creating pickled kd-tree files ...")

    # Two output files that will be saved in `deployment_dir`:
    pmc_pkl_filename = Path(deployment_dir, 'pmc_map.pkl')
    kdtree_pkl_filename = Path(deployment_dir, 'kd_tree.pkl')

    pickle_kd_tree(
        merged_embeddings_filename,
        pmc_pkl_filename, kdtree_pkl_filename
    )

    updater_log("Pickled kd-tree files created\n")
