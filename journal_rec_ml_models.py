from sklearn.decomposition import PCA
from sklearn.neighbors import KNeighborsClassifier
import pandas as pd
import numpy as np

# Datasets
centroid_df = (
    pd.read_csv("data/centroid_dataset.tsv", sep="\t")
    .set_index("journal")
)

subsampled_df = (
    pd.read_csv("data/paper_dataset.tsv.xz", sep="\t")
    .set_index("document")
)

# Set up KNNs
knn_paper_model = KNeighborsClassifier(n_neighbors=10)
knn_paper_model.fit(subsampled_df.drop("journal", axis=1), subsampled_df.journal)

knn_centroid_model = KNeighborsClassifier(n_neighbors=10)
knn_centroid_model.fit(centroid_df.values, centroid_df.reset_index().journal)


def get_neighbors(query):
    """
    Function grabs the closest papers given a query point
    arguments:
        - query a 300 dimension vector to query classifiers
    """
    paper_distance, paper_predictions = knn_paper_model.kneighbors(query)
    A_paper = knn_paper_model.kneighbors_graph(query, mode='distance')
    rows, cols = A_paper.nonzero()
    paper_data = list(zip(
        rows,
        cols, 
        A_paper.data,
        subsampled_df.journal[cols].tolist(),
        subsampled_df.reset_index().document[cols].tolist()
    ))
    
    paper_graph = [
        dict(
            query=data_row[0],
            paper=data_row[1],
            distance=np.round(data_row[2], 3),
            journal=data_row[3],
            pmcid=data_row[4],
            data_type="paper"
        )
        for data_row in paper_data
    ]
    
    A_centroid = knn_centroid_model.kneighbors_graph(query, mode='distance')
    rows, cols = A_centroid.nonzero()
    centroid_data = list(zip(
        rows,
        cols, 
        A_centroid.data,
        centroid_df.reset_index().journal[cols].tolist(),
    ))
    
    centroid_graph = [
        dict(
            query=data_row[0],
            paper=data_row[1],
            distance=np.round(data_row[2], 3),
            journal=data_row[3],
            data_type="centroid"
        )
        for data_row in centroid_data
    ]
    
    full_graph = paper_graph+centroid_graph
    np.random.seed(100)
    np.random.shuffle(full_graph)
    return {
        "graph": full_graph
    }

