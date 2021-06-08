#!/usr/bin/env python3

"""
Merge new papers data with data in previous run.
"""

from utils import set_read_only, updater_log


def simple_merge(input_filenames, merged_filename):
    """
    Merge multiple input files into a single output file.
    The merging is simple: It only removes extra header line(s) without
    checking any duplicate lines or ID columns.
    """

    if type(input_filenames) != list:
        print("ERROR: `input_filenames` must be a list of filenames")
        return

    with open(merged_filename, 'w') as ofh:
        for idx, filename in enumerate(input_filenames):
            with open(filename) as ifh:
                # If current input file is not the first one, skip its header
                if idx > 0:
                    ifh.readline()

                # Copy input file into output file line by line
                for line in ifh:
                    ofh.write(line)

    set_read_only(merged_filename)  # set output file read-only


def merge_files(
        prev_pmc_list_filename,
        prev_embeddings_filename,
        prev_token_counts_filename,
        new_pmc_list_filename,
        new_embeddings_filename,
        new_token_counts_filename,
        merged_pmc_list_filename,
        merged_embeddings_filename,
        merged_token_counts_filename
):
    """
    Merge new papers data files with the data files in previous run.
    """

    updater_log("Merging pmc_list files ...")

    simple_merge(
        [prev_pmc_list_filename, new_pmc_list_filename],
        merged_pmc_list_filename
    )

    updater_log("Merging embeddings files ...")

    simple_merge(
        [prev_embeddings_filename, new_embeddings_filename],
        merged_embeddings_filename
    )

    updater_log("Merging token_counts files ...")

    simple_merge(
        [prev_token_counts_filename, new_token_counts_filename],
        merged_token_counts_filename
    )

    updater_log("Finished merging files")
