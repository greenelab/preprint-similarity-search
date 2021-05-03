from io import BytesIO
import pickle

import lxml.etree as ET
import numpy as np
import spacy
import fitz

disabled_pipelines = ["parser", "ner"]
nlp = spacy.load("en_core_web_sm", disable=disabled_pipelines)
word_model_wv = pickle.load(open("data/word2vec_model/word_model.wv.pkl", "rb"))
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


def parse_content(content, xml_file=True):
    """
    Parses input content and returns a vector based on the pre-loaded
    `word_model_wv`.
    Args:
        content - a PDF file's contents to be parsed
    """
    word_vectors = []
    if xml_file:
        biorxiv_xpath_str = (
            "//abstract/p|//abstract/title|//body/sec//p|//body/sec//title"
        )

        # Parse the xml document
        root = ET.fromstring(content, parser=parser)

        # Process xml without specified tags
        ET.strip_tags(root, *filter_tag_list)

        all_text = root.xpath(biorxiv_xpath_str)
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

        word_vectors += [model.wv[text] for text in all_tokens]
    else:

        # Have a faux file stream for parsing
        text_to_process = BytesIO(content)

        # Use this function to write pdf text to the file stream
        pdf_parser = fitz.open(stream=text_to_process, filetype="pdf")

        # Convert text to word vectors and continue processing
        for page in pdf_parser:

            word_vectors += [
                word_model_wv[tok.lemma_]
                for tok in nlp(page.getText())
                if tok.lemma_ in word_model_wv
                and tok.lemma_ not in nlp.Defaults.stop_words
            ]

    word_embedd = np.stack(word_vectors)
    query_vec = word_embedd.mean(axis=0)[np.newaxis, :]
    return query_vec
