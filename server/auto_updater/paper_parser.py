#!/usr/bin/env python3

import csv
from collections import defaultdict, Counter
#!/usr/bin/env python3

"""
Find new papers in XML tarball files and parse them.
"""

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


def process_tarball(
        tarball_filename, prev_pmc_ids, word_model_wv,
        names_writer, embeddings_writer, token_counts_writer
):
    """
    Search new papers in an input tarball file, and save the new papers
    data on disk.
    """
    tarball_basename = Path(tarball_filename).name
    with tarfile.open(tarball_filename, "r:gz") as tar_fh:
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
            names_writer.writerow(
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

    stop_words = nlp.Defaults.stop_words
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


def parse_new_papers(
        download_dir,
        prev_pmc_dir_filename,
        word_model_vector_filename,
        new_pmc_dir_filename,
        new_embeddings_filename,
        new_token_counts_filename,
):
    updater_log("Start loading word_model_wv ...")
    word_model_wv = pickle.load(open(word_model_vector_filename, "rb"))
    updater_log("word_model_wv loaded successfully")

    # Read previously processed PMC IDs into a set
    prev_pmc_list_df = pd.read_csv(prev_pmc_dir_filename, sep="\t")
    prev_pmc_ids = set()
    for pmc_path in prev_pmc_list_df.file_path.tolist():
        pmc_id = Path(pmc_path).stem
        prev_pmc_ids.add(pmc_id)

    # Process XML tarball files in `download_dir`:
    all_filenames = os.listdir(download_dir)
    tarball_files = [x for x in all_filenames if x.endswith(".xml.tar.gz")]
    with open(new_pmc_dir_filename, "w") as names_fh, \
         open(new_embeddings_filename, "w") as embeddings_fh, \
         open(new_token_counts_filename, "w") as token_counts_fh:
        names_writer = csv.DictWriter(
            names_fh, delimiter="\t", fieldnames=["tarfile", "file_path"]
        )
        names_writer.writeheader()

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

        for basename in sorted(tarball_files):
            tarball_filename = Path(download_dir, basename)
            updater_log(f"start processing {basename}")
            process_tarball(
                tarball_filename, prev_pmc_ids, word_model_wv,
                names_writer, embeddings_writer, token_counts_writer
            )
            updater_log(f"{basename} done\n")


# Test harness
if __name__ == "__main__":
    tarball_dirname = "./data/current_run/output/downloaded_files"
    prev_pmc_dir_filename = "./data/current_run/input/pmc_oa_file_list.tsv"
    word_model_vector_filename = "./data/static/word_model.wv.pkl"

    new_pmc_dir_filename = "./data/current_run/output/new_papers/names.tsv"
    new_embeddings_filename = "./data/current_run/output/new_papers/embeddings.tsv"
    new_token_counts_filename = "./data/current_run/output/new_papers/token_counts.tsv"

    parse_new_papers(
        tarball_dirname,
        prev_pmc_dir_filename,
        word_model_vector_filename,
        new_pmc_dir_filename,
        new_embeddings_filename,
        new_token_counts_filename
    )
