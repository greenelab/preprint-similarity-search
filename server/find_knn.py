import numpy as np
import pandas as pd
import pickle
from sklearn.neighbors import KNeighborsClassifier
from document_downloader import get_doi_content
from utils import create_journal_model, create_paper_models, server_log
from word_vectors import parse_content

N_NEIGHBORS = 10

# Pre-load journal_model
journal_df, journal_model = create_journal_model(N_NEIGHBORS)

# Pre-load paper_models
paper_models = create_paper_models(N_NEIGHBORS)


def get_neighbors(user_doi):
    """
    Find the closest papers and journals given an input paper's DOI.
    Arguments:
        - user_doi: biorxiv DOI
    """

    server_log(f"Received user DOI ({user_doi})")

    content = get_doi_content(user_doi)
    server_log("Downloaded PDF content")

    query_vec = parse_content(content)
    server_log("Converted PDF content to query_vec, start searching KNN now ...")

    paper_knn = get_paper_knn(query_vec)
    journal_knn = get_journal_knn(query_vec)
    server_log("Finished searching KNN\n")

    return {
        "paper_neighbors": paper_knn,
        "journal_neighbors": journal_knn
    }


def get_journal_knn(query_vec):
    """Find the K nearest journals."""

    A_journal = journal_model.kneighbors_graph(query_vec, mode='distance')
    cols = A_journal.nonzero()[1]
    journal_data = list(
        zip(A_journal.data, journal_df.reset_index().journal[cols].tolist())
    )

    journal_knn = [
        dict(
            distance=np.round(data_row[0], 3),
            journal=data_row[1],
        )
        for data_row in journal_data
    ]

    return journal_knn


def get_paper_knn(query_vec):
    """Find the K nearest papers."""

    paper_knn = list()
    for id, sub_model in enumerate(paper_models, start=1):
        sub_papers = sub_model.kneighbors_graph(query_vec, mode='distance')
        cols = sub_papers.nonzero()[1]

        dataset_rows = list(cols)
        distances = list(sub_papers.data)

        # Load h5 file into a store
        h5_filename = f"data/paper_dataset/sub{id}.h5"
        store = pd.HDFStore(h5_filename, mode='r')
        for idx, row in enumerate(dataset_rows):
            neighbor = store.select(
                key='data', columns=['document', 'journal'], start=row, stop=row+1
            )
            node = {
                'distance': distances[idx],
                'journal': neighbor.iloc[0].journal,
                'pmcid': neighbor.iloc[0].document,
            }
            paper_knn.append(node)

        store.close()

    paper_knn = sorted(paper_knn, key=lambda k: k['distance'])[:10]
    return paper_knn
