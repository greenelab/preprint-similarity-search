import numpy as np
import pickle
from io import BytesIO
import spacy
import fitz

nlp = spacy.load("en_core_web_sm")
word_model_wv = pickle.load(open('data/word2vec_model/word_model.wv.pkl', 'rb'))

def parse_content(content, maxpages=999):
    """
    Parses input content and returns a vector based on the pre-loaded
    `word_model_wv`.

    Args:
        content - a PDF file's contents to be parsed
    """
    
    # Have a faux file stream for parsing
    text_to_process = BytesIO(content)
    
    # Use this function to write pdf text to the file stream
    pdf_parser = fitz.open(
        stream=text_to_process, 
        filetype="pdf"
    )
    
    # Convert text to word vectors and continue processing
    word_vectors = []
    for page in pdf_parser:
        tokens = list(map(str, nlp(page.getText())))
        word_vectors += [
            word_model_wv[tok]
            for tok in tokens
            if tok in word_model_wv and tok not in nlp.Defaults.stop_words
        ]

    word_embedd = np.stack(word_vectors)
    query_vec = word_embedd.mean(axis=0)[np.newaxis,:]
    return query_vec
