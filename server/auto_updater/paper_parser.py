#!/usr/bin/env python3

import csv
from collections import defaultdict, Counter
#!/usr/bin/env python3

"""
Find new papers in XML tarball files and parse them.
"""

import csv
import multiprocessing as mp
import os
import pickle
import sys
import tarfile
from pathlib import Path

import lxml.etree as ET
import numpy as np
import pandas as pd
import spacy

from utils import updater_log

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

    # Load word model vector from input pickled filename
    word_model_wv = pickle.load(open(word_model_vector_filename, "rb"))

    # Read previously processed PMC IDs into a set
    prev_pmc_list_df = pd.read_csv(prev_pmc_dir_filename, sep="\t")
    prev_pmc_ids = set()
    for pmc_path in prev_pmc_list_df.file_path.tolist():
        pmc_id = Path(pmc_path).stem
        prev_pmc_ids.add(pmc_id)

    print(tarball_filename)  # dhu

    tarball_basename = Path(tarball_filename).name
    with tarfile.open(tarball_filename, "r:gz") as tar_fh:
        # Write header lines into three output files
        with open(new_pmc_list_filename, "w") as pmc_list_fh, \
         open(new_embeddings_filename, "w") as embeddings_fh, \
         open(new_token_counts_filename, "w") as token_counts_fh:
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

        tar_counter = new_counter = 0  # dhu debug
        for pmc_paper in tar_fh.getmembers():
            paper_name = pmc_paper.name
            pmc_id = Path(paper_name).stem

            # dhu debug
            if tar_counter == 0:
                updater_log(f": {tarball_filename} opened")

            tar_counter += 1
            if tar_counter % 1000 == 0:
                updater_log(f"{paper_name}: {new_counter} / {tar_counter}")
            # end of dhu debug

            # dhu: only process regular files that are new
            if not pmc_paper.isfile() or pmc_id in prev_pmc_ids:
                continue

            # Some papers exist in both "comm_use.*.xml.tar.gz" and
            # "non_comm_use.*.xml.tar.gz" files, so `prev_pmc_ids` is updated to
            # prevent these duplicate papers from being processed more than once.
            prev_pmc_ids.add(pmc_id)

            new_counter += 1  # dhu debug

            # Add a new paper's name no matter whether it can be parsed
            # succesful or not
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
    combine_new_embeddings(embeddings_subdir, new_embeddings_filename)
    combine_new_token_counts(token_counts_subdir, new_token_counts_filename)


def combine_new_pmc_list(pmc_list_subdir, new_pmc_list_filename):
    """
    Combine PMC list output files generated by each process into a single one.
    It doesn't matter if the combined file includes duplicates.
    """

    sub_files = sorted(os.listdir(pmc_list_subdir))

    with open(new_pmc_list_filename, 'w') as ofh:
        for idx, filename in enumerate(sub_files):
            file_path = Path(pmc_list_subdir, filename)
            with open(file_path) as ifh:
                # If current input file is not the first one, skip header
                if idx > 0:
                    ifh.readline()

                # Copy input file into output file line by line
                for line in ifh:
                    ofh.write(line)


def combine_new_embeddings(embeddings_subdir, new_embeddings_filename):
    """
    Combine embeddings files generated by each process into a single one.
    Note: Some papers exist in both "comm_use.*.xml.tar.gz" and
    "non_comm_use.*.xml.tar.gz" files, these duplicates must be removed.
    """

    sub_files = sorted(os.listdir(embeddings_subdir))
    pmc_col = 1
    pmc_added = set()

    with open(new_pmc_list_filename, 'w') as ofh:
        for idx, filename in enumerate(sub_files):
            file_path = Path(pmc_list_subdir, filename)
            with open(file_path) as ifh:
                for line_num, line in enumerate(ifh):
                    # Only copy header line from the first file
                    if line_num == 0:
                        if idx == 0:
                            ofh.write(line)
                        continue

                    pmc_id = line.split('\t')[pmc_col]
                    if pmc_id not in pmc_added:
                        ofh.write(line)
                        pmc_added.add(pmc_id)


def combine_new_token_counts(token_counts_subdir, new_token_counts_filename):
    """
    Combine token_counts files generated by each process into a single one.
    This is a little more complex, because each row's `document` column
    in input files are NOT unique.
    """

    sub_files = sorted(os.listdir(token_counts_subdir))
    pmc_added = set()

    with open(new_token_counts_filename, mode='w') as ofh:
        fieldnames = ['document', 'lemma', 'count']
        writer = csv.DictWriter(ofh, fieldnames=fieldnames, delimiter='\t')
        writer.writeheader()

        for filename in sub_files:
            file_path = Path(pmc_list_subdir, filename)
            with open(file_path) as ifh:
                prev_pmc = None
                csv_reader = csv.DictReader(ifh, delimiter='\t')
                for row in csv_reader:
                    pmc_id = row['document']
                    if pmc_id in pmc_added:
                        continue

                    if pmc_id != prev_pmc:  # another paper's token count session
                        if prev_pmc:
                            pmc_added.add(prev_pmc)
                        prev_pmc = pmc_id

                    writer.writerow(row)


def parse_new_papers(
        tarball_dir,
        prev_pmc_list_filename,
        word_model_vector_filename,
        new_pmc_list_filename,
        new_embeddings_filename,
        new_token_counts_filename,
):
    """Process tarball files and find new papers in parallel."""

    all_filenames = os.listdir(tarball_dir)
    tarball_files = [x for x in all_filenames if x.endswith(".xml.tar.gz")]

    new_papers_dir = Path(new_pmc_list_filename).parent

    pmc_list_subdir = Path(new_papers_dir, 'pmc_list')
    os.makedirs(pmc_list_subdir, exist_ok=True)

    embeddings_subdir = Path(new_papers_dir, 'embeddings')
    os.makedirs(embeddings_subdir, exist_ok=True)

    token_counts_subdir = Path(new_papers_dir, 'token_counts')
    os.makedirs(token_counts_subdir, exist_ok=True)

    parallel = 4
    pool = mp.Pool(parallel)
    for basename in sorted(tarball_files):
        tarball_filename = Path(tarball_dir, basename)
        # Each process's output file basename is the tarball filename
        # with an extra ".tsv" suffix.
        output_basename = basename + ".tsv"
        args = (
            tarball_filename,
            prev_pmc_list_filename,
            word_model_vector_filename,
            Path(pmc_list_subdir, output_basename),
            Path(embeddings_subdir, output_basename),
            Path(token_counts_subdir, output_basename),
        )
        pool.apply_async(process_tarball, args)

    pool.close()
    pool.join()

    combine_new_papers(
        pmc_list_subdir, new_pmc_list_filename,
        embeddings_subdir, new_embeddings_filename,
        token_counts_subdir, new_token_counts_filename
    )


# Test harness
if __name__ == "__main__":
    tarball_dir = "./data/current_run/output/downloaded_files"
    prev_pmc_list_filename = "./data/current_run/input/pmc_oa_file_list.tsv"
    word_model_vector_filename = "./data/static/word_model.wv.pkl"

    new_pmc_list_filename = "./data/current_run/output/new_papers/names.tsv"
    new_embeddings_filename = "./data/current_run/output/new_papers/embeddings.tsv"
    new_token_counts_filename = "./data/current_run/output/new_papers/token_counts.tsv"

    parse_new_papers(
        tarball_dir,
        prev_pmc_list_filename,
        word_model_vector_filename,
        new_pmc_list_filename,
        new_embeddings_filename,
        new_token_counts_filename
    )
