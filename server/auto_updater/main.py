#!/usr/bin/env python3

"""
Main Python module that starts the auto-updater pipeline.
"""

import os
from pathlib import Path

from downloader import download_xml_files
from paper_parser import parse_new_papers

from utils import updater_log


# Main program
if __name__ == "__main__":
    # Get name of the directory that this script is located:
    parent_dir = Path(__file__).resolve().parent

    # Static data dir
    static_data_dir = Path(parent_dir, 'data', 'static')

    # Static data files that will be read by each updater run
    pca_axes_filename = Path(static_data_dir, 'pca_components.tsv')
    word_model_vector_filename = Path(static_data_dir, 'word_model.wv.pkl')

    # Input/output data directory for current run
    curr_data_dir = Path(parent_dir, 'data', 'current_run')

    # Input dir
    input_dir = Path(curr_data_dir, 'input')

    # Input files: data from previous run
    prev_pmc_list_filename = Path(input_dir, 'pmc_oa_file_list.tsv')
    prev_embeddings_filename = Path(input_dir, 'embeddings_full.tsv')
    prev_token_counts_filename = Path(input_dir,'global_token_counts.tsv')

    # Output dir
    output_dir = Path(curr_data_dir, 'output')
    os.makedirs(output_dir, exist_ok=True)    # If not exist yet, create it

    # ------------------------------------------------------------------
    #                    Run the pipeline
    # ------------------------------------------------------------------

    # (1) Download XML tarball files
    # ------------------------------------------------------------------
    # Output dir where the downloaded files will be saved in
    download_dir = Path(output_dir, 'downloaded_files')
    os.makedirs(download_dir, exist_ok=True)  # If not exist yet, create it

    print(flush=True)
    download_xml_files(download_dir)

    # (2) Find new papers in downloaded files and process them
    # ------------------------------------------------------------------
    # Output dir for new papers data
    new_papers_dir = Path(output_dir, 'new_papers')
    os.makedirs(new_papers_dir, exist_ok=True)  # If not exist yet, create it

    # Output files for new papers
    new_pmc_list_basename = 'pmc_list.tsv'
    new_embeddings_basename = 'embeddings.tsv'
    new_token_counts_basename = 'token_counts.tsv'

    print(flush=True)
    updater_log("Finding and parsing new papers ...")
    parse_new_papers(
        download_dir,
        prev_pmc_list_filename,
        word_model_vector_filename,
        new_papers_dir,
        new_pmc_list_basename,
        new_embeddings_basename,
        new_token_counts_basename,
    )

    # (3) Merge new papers data with previous run
    # ------------------------------------------------------------------
    # Output files: merged data of both previous and new papers
    merged_pmc_list_filename = Path(output_dir, 'pmc_oa_file_list.tsv')
    merged_embeddings_filename = Path(output_dir, 'embeddings_full.tsv')
    merged_token_counts_filename = Path(output_dir, 'global_token_counts.tsv')

    print(flush=True)
    updater_log("Merging new data with last run ...")
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

    # (4) Create new journal centroid based on merged data
    # ------------------------------------------------------------------
    # Output file: journal centroid
    journal_centroid_filename = Path(output_dir, 'journals.tsv')

    print(flush=True)
    Updater_log("Updating centroid dataset ...")
    generate_journal_centroid(
        merged_embeddings_filename,
        journal_centroid_filename
    )

    # (5) Generate sauice coordinates for new papers and update the sqaure bins
    # -------------------------------------------------------------------------
    # Output files: paper landscape file and intermediate PMC plot JSON file
    paper_landscape_filename = Path(output_dir, 'paper_landscape.tsv')
    tmp_plot_filename = Path(output_dir, 'pmc_plot_tmp.json')

    print(flush=True)
    updater_log("Generating SAUCIE coordinates and updating square bins ...")
    generate_SAUCIE_coordinates(
        new_embeddings_filename,
        paper_landscape_filename,
        tmp_plot_filename
    )

    # (6) Update bin stats
    # ------------------------------------------------------------------
    # Output file: final PMC plot JSON file
    final_plot_filename = Path(output_dir, 'pmc_plot.json')

    print(flush=True)
    updater_log("Updating each bin stats and creating PMC plot JSON file ...")
    update_paper_bins_stats(
        paper_landscape_filename,
        merged_embeddings_filename,
        merged_token_counts_filename,
        pca_axes_filename,
        tmp_plot_filename,
        final_plot_filename
    )

    # (7) Minimize plot JSON file for frontend
    # ------------------------------------------------------------------
    # Deployment dir: create it if not exist yet.
    deployment_dir = Path(output_dir, 'deployment')
    os.makedirs(deployment_dir, exist_ok=True)

    # Output file: minimized plot JSON file for frontend deployment
    mini_plot_filename = Path(deployment_dir, 'plot.json')

    print(flush=True)
    Updater_log("Creating minimized plot JSON file ...")

    # (8) Create kdtree-related pickle files for backend
    # ------------------------------------------------------------------
    # Output files: pickled files for backend deployment:
    pickled_kdtree_filename = Path(deployment_dir, 'kdtree.pkl')
    pickled_pmc_map_filename = Path(deployment_dir, 'pmc_map.pkl')

    print(flush=True)
    Updater_log("Creating pickled kd-tree files ...")
