#!/usr/bin/env python3

"""
Find new papers in XML tarball files and parse them.
"""

import csv
import multiprocessing as mp
import os
import pickle
import tarfile
from collections import Counter
from pathlib import Path

import lxml.etree as ET
import numpy as np
import pandas as pd
import spacy

from utils import set_read_only, updater_log

# Default pipelines: only "parser" and "ner" can be disabled.
# Disabling any other pipelines will affect the lemma functionality.
disabled_pipelines = ["parser", "ner"]
nlp = spacy.load("en_core_web_sm", disable=disabled_pipelines)

xpath = "//abstract/sec/*|//body/sec/*|//abstract/p|//body/sec/*|//body/p"
filter_tags = [
    "sc",
    "italic",
    "xref",
    "label",
    "sub",
    "sup",
    "inline-formula",
    "fig",
    "disp-formula",
    "bold",
    "table-wrap",
    "table",
    "thead",
    "tbody",
    "caption",
    "tr",
    "td",
]
parser = ET.XMLParser(encoding="UTF-8", recover=True)
stop_words = nlp.Defaults.stop_words


def process_tarball(
        tarball_filename,
        prev_pmc_list_filename,
        word_model_vector_filename,
        new_pmc_list_filename,
        new_embeddings_filename,
        new_token_counts_filename,
):
    """
    Search new papers in an input tarball file, and save the new papers
    data on disk.
    """
    updater_log(f"Processing '{tarball_filename}' ...")

    # Load word model vector from input pickled filename
    word_model_wv = pickle.load(open(word_model_vector_filename, "rb"))

    # Read previously processed PMC IDs into a set
    prev_pmc_list_df = pd.read_csv(prev_pmc_list_filename, sep="\t")
    prev_pmc_ids = set()
    for pmc_path in prev_pmc_list_df.file_path.tolist():
        pmc_id = Path(pmc_path).stem
        prev_pmc_ids.add(pmc_id)

    tarball_basename = Path(tarball_filename).name
    with tarfile.open(tarball_filename, "r:gz") as tar_fh:
        # Write header lines into three output files
        with open(new_pmc_list_filename, 'w', newline='') as pmc_list_fh, \
         open(new_embeddings_filename, 'w', newline='') as embeddings_fh, \
         open(new_token_counts_filename, 'w', newline='') as token_counts_fh:
            pmc_list_writer = csv.DictWriter(
                pmc_list_fh, delimiter="\t", fieldnames=["tarfile", "file_path"]
            )
            pmc_list_writer.writeheader()

            embeddings_writer = csv.DictWriter(
                embeddings_fh,
                delimiter="\t",
                fieldnames=["journal", "document"] + [f"feat_{idx}" for idx in range(300)],
            )
            embeddings_writer.writeheader()

            token_counts_writer = csv.DictWriter(
                token_counts_fh,
                delimiter="\t",
                fieldnames=["document", "lemma", "count"]
            )
            token_counts_writer.writeheader()

            write_data(
                word_model_wv, prev_pmc_ids, tarball_basename, tar_fh,
                pmc_list_writer, embeddings_writer, token_counts_writer
            )

    # Set output files read-only
    set_read_only(new_pmc_list_filename)
    set_read_only(new_embeddings_filename)
    set_read_only(new_token_counts_filename)

    updater_log(f"'{tarball_filename}' is done")


def write_data(
        word_model_wv, prev_pmc_ids, tarball_basename, tar_fh,
        pmc_list_writer, embeddings_writer, token_counts_writer
):
    """Write new papers data to disk."""

    for pmc_paper in tar_fh.getmembers():
        paper_name = pmc_paper.name
        pmc_id = Path(paper_name).stem

        # Only process regular files that are new
        if not pmc_paper.isfile() or pmc_id in prev_pmc_ids:
            continue

        # Save a new paper's name to pmc_list no matter it can be parsed or not
        pmc_list_writer.writerow(
            {"tarfile": tarball_basename, "file_path": paper_name}
        )

        paper_fh = tar_fh.extractfile(pmc_paper)
        doc_vector, word_counter = generate_vector_counts(
            word_model_wv, paper_fh
        )

        # If the paper doesn't include valid words, do not write
        # embeddings and token count.
        if word_counter is None:
            continue

        embeddings_writer.writerow(
            {
                "document": pmc_id,
                "journal": str(Path(paper_name).parent),
                **dict(
                    zip([f"feat_{idx}" for idx in range(300)], doc_vector)
                ),
            }
        )

        for tok in word_counter:
            token_counts_writer.writerow(
                {
                    "document": pmc_id,
                    "lemma": tok,
                    "count": word_counter[tok],
                }
            )


def generate_vector_counts(word_model_wv, paper_fh):
    """
    Parse a paper file (paper_fh) based on word model vector (word_model_wv).
    """

    word_vectors = []
    tree = ET.parse(paper_fh, parser=parser)

    # Process xml without specified tags
    ET.strip_tags(tree, *filter_tags)
    root = tree.getroot()

    # Skip non-research papers
    if root.attrib['article-type'].strip() != 'research-article':
        return [], None

    all_text = root.xpath(xpath)  # a list of 'xml.etree._Element' instances

    all_text = list(map(lambda x: "".join(list(x.itertext())), all_text))
    # all_text[idx].itertext() returns an instance of 'lxml.etree.ElementTextIterator';
    # list(x.itertext()) returns a list of strings (including '\n');
    # "".join(...) combines the list of strings into a single string;
    # map(...) returns an iterable of single string for each entry in all_text;
    # list(map(...)) converts the iterable of single string into a list of single string.

    # dhu: combine all single strings together into ONE single string.
    all_text = " ".join(all_text)

    # Optimization: Remove stop words from `all_text` before feeding it to nlp.
    # This optimization not only speeds up the data processing 5%-10%, but also
    # minimizes memory usage.
    all_text = [x for x in all_text.split() if x not in stop_words]
    all_text = " ".join(all_text)

    # Set nlp.max_length dynamically
    if nlp.max_length < len(all_text):
        nlp.max_length = len(all_text)
        updater_log(f"set nlp.max_length to: {nlp.max_length}")

    all_tokens = list(
        map(
            lambda x: x.lemma_,
            filter(
                lambda tok: tok.lemma_ in word_model_wv and tok.lemma_ not in stop_words,
                nlp(all_text),
            )
        )
    )

    # Skip wonky papers that have less than 20 tokens
    if len(all_tokens) < 20:
        return [], None

    word_vectors += [word_model_wv[text] for text in all_tokens]

    # Skip papers that don't contain text
    if len(word_vectors) > 0:
        return np.stack(word_vectors).mean(axis=0), Counter(all_tokens)

    return [], None


def combine_new_papers(
        pmc_list_subdir, new_pmc_list_filename,
        embeddings_subdir, new_embeddings_filename,
        token_counts_subdir, new_token_counts_filename
):
    combine_new_pmc_list(pmc_list_subdir, new_pmc_list_filename)

    num_new_papers = combine_new_embeddings(
        embeddings_subdir, new_embeddings_filename
    )

    combine_new_token_counts(token_counts_subdir, new_token_counts_filename)

    return num_new_papers


def combine_new_pmc_list(pmc_list_subdir, combined_pmc_list_filename):
    """
    Combine PMC list output files generated by each process into a single one.
    It doesn't matter if the combined file includes duplicates.
    """

    sub_files = sorted(os.listdir(pmc_list_subdir))

    with open(combined_pmc_list_filename, 'w') as ofh:
        for idx, filename in enumerate(sub_files):
            file_path = Path(pmc_list_subdir, filename)
            with open(file_path) as ifh:
                # If current input file is not the first one, skip header
                if idx > 0:
                    ifh.readline()

                # Copy input file into output file line by line
                for line in ifh:
                    ofh.write(line)

    # Set combined output file read-only
    set_read_only(combined_pmc_list_filename)


def combine_new_embeddings(embeddings_subdir, combined_embeddings_filename):
    """
    Combines embeddings files generated by each process into a single one.
    Note: Some papers exist in both "comm_use.*.xml.tar.gz" and
    "non_comm_use.*.xml.tar.gz" files, these duplicates must be removed.

    Returns the number of new papers.
    """

    sub_files = sorted(os.listdir(embeddings_subdir))
    pmc_col = 1
    merged_pmc = set()

    with open(combined_embeddings_filename, 'w') as ofh:
        for idx, filename in enumerate(sub_files):
            file_path = Path(embeddings_subdir, filename)
            with open(file_path) as ifh:
                for line_num, line in enumerate(ifh):
                    # Only copy header line from the first file
                    if line_num == 0:
                        if idx == 0:
                            ofh.write(line)
                        continue

                    pmc_id = line.split('\t')[pmc_col]
                    if pmc_id not in merged_pmc:
                        ofh.write(line)
                        merged_pmc.add(pmc_id)

    # Set combined output file read-only
    set_read_only(combined_embeddings_filename)

    # Return the number of new papers found
    return len(merged_pmc)


def combine_new_token_counts(token_counts_subdir, combined_token_counts_filename):
    """
    Combine token_counts files generated by each process into a single one.
    This is a little more complex, because each row's `document` column
    in input files are NOT unique.
    """

    sub_files = sorted(os.listdir(token_counts_subdir))
    merged_pmc = set()

    with open(combined_token_counts_filename, 'w', newline='') as ofh:
        fieldnames = ['document', 'lemma', 'count']
        writer = csv.DictWriter(ofh, fieldnames=fieldnames, delimiter='\t')
        writer.writeheader()

        for filename in sub_files:
            file_path = Path(token_counts_subdir, filename)
            with open(file_path, newline='') as ifh:
                prev_pmc = None
                csv_reader = csv.DictReader(ifh, delimiter='\t')
                for row in csv_reader:
                    pmc_id = row['document']

                    if pmc_id in merged_pmc:
                        continue

                    if pmc_id != prev_pmc: # enter a new token count session
                        if prev_pmc:
                            merged_pmc.add(prev_pmc)
                        prev_pmc = pmc_id

                    writer.writerow(row)

    # Set combined output file read-only
    set_read_only(combined_token_counts_filename)


def parse_new_papers(
        tarball_dir,
        prev_pmc_list_filename,
        word_model_vector_filename,
        new_papers_dir,
        new_pmc_list_basename,
        new_embeddings_basename,
        new_token_counts_basename,
        parallel=4
):
    """Process tarball files and find new papers."""

    all_filenames = os.listdir(tarball_dir)
    tarball_files = [x for x in all_filenames if x.endswith(".xml.tar.gz")]

    pmc_list_subdir = Path(new_papers_dir, 'pmc_list_sub')
    os.makedirs(pmc_list_subdir, exist_ok=True)

    embeddings_subdir = Path(new_papers_dir, 'embeddings_sub')
    os.makedirs(embeddings_subdir, exist_ok=True)

    token_counts_subdir = Path(new_papers_dir, 'token_counts_sub')
    os.makedirs(token_counts_subdir, exist_ok=True)

    pool = mp.Pool(parallel)
    for basename in sorted(tarball_files):
        tarball_filename = Path(tarball_dir, basename)
        # Each process's output file basename is the tarball filename with an
        # extra ".tsv" suffix.
        output_basename = basename + ".tsv"
        args = (
            tarball_filename,
            prev_pmc_list_filename,
            word_model_vector_filename,
            Path(pmc_list_subdir, output_basename),
            Path(embeddings_subdir, output_basename),
            Path(token_counts_subdir, output_basename)
        )

        pool.apply_async(process_tarball, args)

    pool.close()
    pool.join()

    combined_pmc_path = Path(new_papers_dir, new_pmc_list_basename)
    combined_embeddings_path = Path(new_papers_dir, new_embeddings_basename)
    combined_token_counts_path = Path(new_papers_dir, new_token_counts_basename)

    num_new_papers = combine_new_papers(
        pmc_list_subdir, combined_pmc_path,
        embeddings_subdir, combined_embeddings_path,
        token_counts_subdir, combined_token_counts_path
    )

    return num_new_papers


# Test harness
if __name__ == "__main__":
    input_dir = "./data/current_run/input/"
    output_dir = "./data/current_run/output/"

    tarball_dir = output_dir + "downloaded_files"
    prev_pmc_list_filename = input_dir + "pmc_oa_file_list.tsv"
    word_model_vector_filename = "./data/static/word_model.wv.pkl"

    new_papers_dir = output_dir + "new_papers/"
    new_pmc_list_basename = "pmc_list.tsv"
    new_embeddings_basename = "embeddings.tsv"
    new_token_counts_basename = "token_counts.tsv"

    num_new_papers = parse_new_papers(
        tarball_dir,
        prev_pmc_list_filename,
        word_model_vector_filename,
        new_papers_dir,
        new_pmc_list_basename,
        new_embeddings_basename,
        new_token_counts_basename,
        parallel=6
    )

    print(f"{num_new_papers:,} new papers found and parsed")
