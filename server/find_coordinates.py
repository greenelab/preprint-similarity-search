from SAUCIE import SAUCIE, Loader
import numpy as np


def get_coordinates(query_vector):
    """
    Get the 2D coordinates for the query document
    Arguments:
        query_vector - a 300 dimensional document vector to project into 2D space
    """
    saucie_model = SAUCIE(300, restore_folder="saucie_model")
    coordinates = (
        saucie_model
        .get_embedding(
            Loader(query_vector)
        )
    )
    return {
        "x": np.float64(coordinates[0][0]),
        "y": np.float64(coordinates[0][1])
    }


if __name__ == "__main__":
    print(
        get_2d_coordinates(
            np.random.randint(1,10,(1,300))
        )
    )
