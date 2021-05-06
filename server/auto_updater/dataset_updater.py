import csv
from collections import defaultdict, Counter
import lzma
from pathlib import Path
import pickle
import tarfile
import urllib.request as request

import lxml.etree as ET
import numpy as np
import pandas as pd
import spacy
import tqdm

disabled_pipelines = ["parser", "ner"]
nlp = spacy.load("en_core_web_sm", disable=disabled_pipelines)

filter_tag_list = [
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


def calculate_token_counts(global_word_count_file, paper_landscape_file):
    """
    This function is designed to update the current token counts used for the preprint landscape.

    Parameters:
        global_word_count_file - the file path for token counts in every file within PMCOA
        paper_landscape_file - the file that contains the bins each paper is assigned to
    """

    all_paper_bins = pd.read_csv(paper_landscape_file, sep="\t")

    bin_dict = dict(
        zip(
            all_paper_bins["document"].tolist(), all_paper_bins["squarebin_id"].tolist()
        )
    )

    background_bin_dictionaries = defaultdict(Counter)
    word_bin_dictionaries = {
        squarebin_id: defaultdict(Counter)
        for squarebin_id in all_paper_bins["squarebin_id"].unique()
    }

    with lzma.open(global_word_count_file, "rt") as infile:
        count_reader = csv.DictReader(
            infile,
            delimiter="\t",
        )

        for line in tqdm.tqdm(count_reader):
            token_count_entry = {line["lemma"]: int(line["count"])}
            background_bin_dictionaries.update(token_count_entry)
            word_bin_dictionaries[bin_dict[line["document"]]].update(token_count_entry)

    return background_bin_dictionaries, word_bin_dictionaries, bin_dict


def gather_new_papers(
    current_pmc_file,
    word_model,
    temp_dir_filename="new_papers_added_dir.tsv",
    temp_embed_filename="new_papers_embedding.tsv",
    temp_token_counter="new_paper_token_count.tsv",
):
    """
    This function is designed to open a network stream to extract papers from
    PubMed Central Open Access (PMCOA)'s FTP server. The program will scan for all files and grab
    any papers that are not contained within the current paper dataset.

    Parameters:
        current_pmc_file - The listing of papers in PMCOA
        word_model - The word2vec model to generate paper embeddings
        temp_dir_filename - a temp file contains newly added papers
        temp_embed_filename - a file containing new paper embeddingss
        temp_token_counter - a file containing new tokens from processed papers
    """

    # Grab Current List
    current_pmc_list_df = pd.read_csv(current_pmc_file, sep="\t")
    current_pmc_set = set(current_pmc_list_df.file_path.tolist())

    # Grab file list on ftp server
    pmc_open_access_url = "ftp://ftp.ncbi.nlm.nih.gov/pub/pmc/oa_bulk/"
    response = request.urlopen(f"{pmc_open_access_url}")
    files = response.read().decode("utf-8").splitlines()
    tar_files = [f.split(" ")[-1] for f in files]

    with open(temp_dir_filename, "w") as dir_file, open(
        temp_embed_filename, "w"
    ) as embed_file, open(temp_token_counter, "w") as word_file:
        dir_writer = csv.DictWriter(
            dir_file, delimiter="\t", fieldnames=["tarfile", "file_path"]
        )
        dir_writer.writeheader()

        embed_writer = csv.DictWriter(
            embed_file,
            delimiter="\t",
            fieldnames=["journal", "document"] + [f"feat_{idx}" for idx in range(300)],
        )
        embed_writer.writeheader()

        count_writer = csv.DictWriter(
            word_file, delimiter="\t", fieldnames=["document", "lemma", "count"]
        )
        count_writer.writeheader()

        # Cycle through each tar file on the server
        for tar_file in tqdm.tqdm(tar_files):

            # If not xml files skip
            if all(suffix != ".xml" for suffix in Path(tar_file).suffixes):
                continue

            # If temp file skip
            if Path(tar_file).suffix == ".tmp":
                continue

            # Grab the file from the tarfile
            print(f"Requesting {pmc_open_access_url}{tar_file}....")
            requested_file_stream = request.urlopen(f"{pmc_open_access_url}{tar_file}")
            open_stream = tarfile.open(fileobj=requested_file_stream, mode="r|gz")

            # Cycle through paper members
            # Grab new papers and get the document vectors
            while True:
                try:

                    pmc_paper = open_stream.next()

                    if pmc_paper is None:
                        break

                    if pmc_paper.isdir():
                        continue

                    if pmc_paper.name in current_pmc_set:
                        continue

                    new_paper = open_stream.extractfile(pmc_paper)
                    doc_vector, word_counter = generate_vector_counts(
                        word_model,
                        new_paper,
                        "//abstract/sec/*|//abstract/p|//body/sec/*|//body/p",
                    )

                    dir_writer.writerow(
                        {"tarfile": tar_file, "file_path": str(pmc_paper.name)}
                    )

                    if word_counter is None:
                        continue

                    embed_writer.writerow(
                        {
                            "document": Path(pmc_paper.name).stem,
                            "journal": str(Path(pmc_paper.name).parent),
                            **dict(
                                zip([f"feat_{idx}" for idx in range(300)], doc_vector)
                            ),
                        }
                    )

                    for tok in word_counter:
                        count_writer.writerow(
                            {
                                "document": Path(pmc_paper.name).stem,
                                "lemma": tok,
                                "count": word_counter[tok],
                            }
                        )

                except tarfile.ReadError as e:
                    print(
                        f"File {pmc_open_access_url}{tar_file} achieved an error: {str(e)}"
                    )
                    print("Skipping...")
                    break

            open_stream.close()
            requested_file_stream.close()


def generate_vector_counts(model, document_path, xpath, filter_tags=filter_tag_list):
    """
    This method is designed to construct document vectors for a given xml document.
    Every document has specific tags that are striped in order to have accurate embeddings

    Keyword arguments:
        model - the model to extract word vectors from
        xpath_str - the xpath string to extract tags from the xml document
        filter_tag_list - the list of tags to strip from the xml document
    """

    word_vectors = []

    tree = ET.parse(document_path, parser=parser)

    # Process xml without specified tags
    ET.strip_tags(tree, *filter_tags)

    root = tree.getroot()

    if root.attrib["article-type"].strip() != "research-article":
        return [], None

    root = tree.getroot()
    all_text = root.xpath(xpath)
    all_text = list(map(lambda x: "".join(list(x.itertext())), all_text))
    all_text = " ".join(all_text)

    all_tokens = list(
        map(
            lambda x: x.lemma_,
            filter(
                lambda tok: tok.lemma_ in model.wv
                and tok.lemma_ not in nlp.Defaults.stop_words,
                nlp(all_text),
            ),
        )
    )

    # Skip wonky papers that have less than 20 tokens
    if len(all_tokens) < 20:
        return [], None

    word_vectors += [model.wv[text] for text in all_tokens]

    # skips weird documents that don't contain text
    if len(word_vectors) > 0:
        return np.stack(word_vectors).mean(axis=0), Counter(all_tokens)

    return [], None


def merge_files(current_file, temp_file):
    """
    This function is designed to append entries from the temporary file into the file
    that needs to be updated

    Parameters:
        current_file - the file to be updated
        temp_file - the file that conatins information on new papers
    """

    if Path(current_file).suffix == ".xz":
        outfile = lzma.open(current_file, "at")

    else:
        outfile = open(current_file, "a")

    infile = open(temp_file, "r")
    inreader = csv.DictReader(infile, delimiter="\t")
    outwriter = None

    for line in tqdm.tqdm(inreader):
        fieldnames = line.keys()

        if outwriter is None:
            outwriter = csv.DictWriter(outfile, delimiter="\t", fieldnames=fieldnames)

        outwriter.writerow(line)

    infile.close()
    outfile.close()
