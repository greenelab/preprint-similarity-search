from io import BytesIO
from pathlib import Path

from gensim.models import Word2Vec
from gensim.parsing.preprocessing import remove_stopwords
import numpy as np

from docx import Document
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

def parse_uploaded_file(content, filename):
    """
    This function takes in content that was uploaded 
    via the dash upload option.
    
    Args:
        content - the file contents to be parsed based on extension
        filename - the name of the file that has been uploaded
    """
    file_path = Path(filename)
    
    if "pdf" in file_path.suffix:
        print("pdf")
        text_to_process = extract_text(BytesIO(content))
        query = process_text(text_to_process.lower().split("\n"))
        return query
    
    if "docx" in file_path.suffix or "doc" in file_path.suffix:
        print("docx")
        docx_obj = Document(BytesIO(content))
        full_text = []
        
        # Grab all the text
        for paragraph in docx_obj.paragraphs:
            full_text.append(paragraph.text.lower())
            
        query = process_text(full_text)
        return query

    if "txt" in file_path.suffix:
        print("txt")
        text_to_process = content.decode("utf-8")
        query = process_text(text_to_process.lower().split("\n"))
        return query
    
    raise Exception("Error! Please upload with the following extensions: docx, pdf, txt")