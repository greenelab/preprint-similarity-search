#!/usr/bin/env python3

"""
Main Python module that starts the auto-updater pipeline.
"""

import os
from pathlib import Path

from bin_stats_updater import update_paper_bins_stats
from downloader import download_xml_files
from journal_centroid import generate_journal_centroid
from merger import merge_files
from paper_parser import parse_new_papers
from saucie_corrdinates import generate_saucie_coordinates
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
    current_data_dir = Path(parent_dir, 'data', 'current_run')

    # Input dir
    input_dir = Path(current_data_dir, 'input')

    # Output dir
    output_dir = Path(current_data_dir, 'output')
    os.makedirs(output_dir, exist_ok=True)    # If not exist yet, create it

    # ------------------------------------------------------------------
    #                    Run the pipeline
    # ------------------------------------------------------------------

    # (1) Download XML tarball files
    # ------------------------------------------------------------------
    # Output dir where the downloaded files will be saved in
    download_dir = Path(output_dir, 'downloaded_files')
    os.makedirs(download_dir, exist_ok=True)  # If not exist yet, create it

    updater_log("Start auto_updater pipeline", prefix_blank_line=True)
    '''dhu
    download_xml_files(download_dir)
    '''

    # (2) Find new papers in downloaded files and process them
    # ------------------------------------------------------------------
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

    updater_log("Find and parse new papers", prefix_blank_line=True)

    '''dhu
    parse_new_papers(
        download_dir,
        prev_pmc_list_filename,
        word_model_vector_filename,
        new_papers_dir,
        new_pmc_list_basename,
        new_embeddings_basename,
        new_token_counts_basename,
        parallel=parallel
    )
    '''

    # (3) Merge new papers data with previous run
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

    updater_log("Merge new data with last run", prefix_blank_line=True)

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

    Updater_log("Updating centroid dataset ...", prefix_blank_line=True)
    generate_journal_centroid(
        merged_embeddings_filename,
        journal_centroid_filename
    )

    # (5) Generate saucie coordinates for new papers and update the sqaure bins
    # -------------------------------------------------------------------------
    # Input file: paper tsne file in last run
    old_pmc_tsne_filename = Path(input_dir, 'pmc_tsne_square.tsv')

    # Output files: paper landscape file and intermediate PMC plot JSON file
    updated_pmc_tsne_filename = Path(output_dir, 'pmc_tsne_square.tsv')
    tmp_plot_filename = Path(output_dir, 'pmc_plot_tmp.json')

    updater_log(
        "Updating SAUCIE coordinates and square bins ..."
        prefix_blank_line=True
    )
    generate_SAUCIE_coordinates(
        new_embeddings_filename,
        old_pmc_tsne_filename,
        updated_pmc_tsne_filename,
        tmp_plot_filename
    )
    updater_log("SAUCIE coordinates and square bins updated")


    # (6) Update bin stats
    # ------------------------------------------------------------------
    # Output file: final PMC plot JSON file
    final_plot_filename = Path(output_dir, 'pmc_plot_final.json')

    updater_log(
        "Updating PMC plot json file ...",
        prefix_blank_line=True
    )
    update_paper_bins_stats(
        paper_landscape_filename,
        merged_embeddings_filename,
        merged_token_counts_filename,
        pca_axes_filename,
        tmp_plot_filename,
        final_plot_filename
    )
    updater_log("PMC plot json file updated")

    # (7) Minimize plot JSON file for frontend
    # ------------------------------------------------------------------
    # Deployment dir: create it if not exist yet.
    deployment_dir = Path(output_dir, 'deployment')
    os.makedirs(deployment_dir, exist_ok=True)

    # Output file: minimized plot JSON file for frontend deployment
    mini_plot_filename = Path(deployment_dir, 'plot.json')

    Updater_log("Creating minimized plot JSON file ...", prefix_blank_line=True)

    # (8) Create kdtree-related pickle files for backend
    # ------------------------------------------------------------------
    # Output files: pickled files for backend deployment:
    pickled_kdtree_filename = Path(deployment_dir, 'kdtree.pkl')
    pickled_pmc_map_filename = Path(deployment_dir, 'pmc_map.pkl')

    Updater_log("Creating pickled kd-tree files ...", prefix_blank_line=True)
