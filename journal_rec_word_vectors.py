from io import BytesIO
from pathlib import Path

from gensim.models import Word2Vec
from gensim.parsing.preprocessing import remove_stopwords
import numpy as np

from pdfminer.high_level import extract_text

word_model = Word2Vec.load("data/word2vec_model/biorxiv_300.model")


def process_text(sentences):
    """
    This function converts list of strings into list of word vectors
    
    Args:
        sentences - a list of strings (sentence from a file)
    """
    word_vectors = []
    for sentence in sentences:
        preprocessed_sentence = remove_stopwords(sentence)
        word_vectors += [
            word_model.wv[tok]
            for tok in preprocessed_sentence.split(" ") 
            if tok in word_model.wv
        ]

    word_embedd = np.stack(word_vectors)
    return word_embedd.mean(axis=0)[np.newaxis,:]


def parse_uploaded_file(content):
    """
    This function takes in the pdf content from a biorxiv preprint
    to be used by a machine learning module in downstream processing
    
    Args:
        content - the file contents to be parsed based on extension
    """
    text_to_process = extract_text(BytesIO(content))
    query = process_text(text_to_process.lower().split("\n"))
    return query

