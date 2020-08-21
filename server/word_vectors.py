import numpy as np
import pickle
from io import BytesIO, StringIO
from gensim.parsing.preprocessing import remove_stopwords
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams

word_model_wv = pickle.load(open('data/word2vec_model/word_model.wv.pkl', 'rb'))

def parse_content(content, maxpages=999):
    """
    Parses input content and returns a vector based on the pre-loaded
    `word_model_wv`.

    Args:
        content - a PDF file's contents to be parsed
    """
    
    # Have a faux file stream for parsing
    text_to_process = StringIO()
    
    # Use this function to write pdf text to the file stream
    extract_text_to_fp(
        BytesIO(content), text_to_process, 
        disable_caching=True, maxpages=maxpages,
        laparams=LAParams()
    )
    
    # Convert text to word vectors and continue processing
    lines = text_to_process.getvalue().lower().split("\n")

    word_vectors = []
    for line in lines:
        preprocessed_line = remove_stopwords(line)
        word_vectors += [
            word_model_wv[tok]
            for tok in preprocessed_line.split(" ")
            if tok in word_model_wv
        ]

    word_embedd = np.stack(word_vectors)
    query_vec = word_embedd.mean(axis=0)[np.newaxis,:]
    return query_vec
