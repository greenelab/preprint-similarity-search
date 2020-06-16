import base64
import json

import dash
import numpy as np
import pandas as pd

from journal_rec_ml_models import get_neighbors
from journal_rec_word_vectors import parse_uploaded_file

def displayTapNodeData(data):
    """
    This function is designed to render the data table
    for the user
    
    Args:
        data - the node that the user has highlighted
    """
    if data and 'journal' in data:
        if data['data_type'] == 'paper':
            columns=[
                {"name":col.upper(), "id":col} 
                for col in ["journal", "paper"]
            ]
            data=[
                {
                    "journal":data['journal'],
                    "paper":data['label']
                }
            ]
        else:
            columns=[
                {"name":col.upper(), "id":col} 
                for col in ["journal"]
            ]
            data = [
                {"journal":data['journal']}
            ]
        return columns, data
    else:
        columns = [{"name":"journal", "id":"journal"}]
        data = [{"journal":"Joural Title Goes here"}]
        return columns, data
    
def generate_graph(query):
    """
    This function is designed to render the paper-journal 
    network for the user
    
    Args:
        query - the document vector that was processed by the app
    """
    query = json.loads(query)
    results = get_neighbors(query)
    print(results)
    
    gathered_nodes = set()
    nodes = []
    edges = []

    for datapoint in results["graph"]:
        query_label = f"query_{datapoint['query']+1}"
       
        if query_label not in gathered_nodes:
            label = query_label
            nodes.append(
                dict(
                    data=dict(
                        id=query_label, 
                        label=query_label,
                        data_type="query"
                    )
                )
            )
            
            gathered_nodes.add(query_label)
        
        neighbor_label = (
            datapoint['pmcid'] 
            if datapoint['data_type'] == "paper" 
            else datapoint['journal']
        )

        if neighbor_label not in gathered_nodes:
            nodes.append(
                dict(
                    data=dict(
                        id=neighbor_label, 
                        label=neighbor_label,
                        journal=datapoint['journal'],
                        data_type=datapoint['data_type']
                    )
                )
            )

            gathered_nodes.add(neighbor_label)
        
        edges.append(
            dict(
                data=dict(
                    source=neighbor_label,
                    target=query_label,
                    weight=datapoint['distance']
                )
            )
        )

    return nodes+edges

def update_output(content, filename, timestamp):
    """
    This function is designed to render the paper-journal 
    network for the user
    
    Args:
        content - the file content in base64
        filename - the name of the file a user will upload
        timestamp - the timestamp of the upload
    """
    try:
        # If the user inputs a document
        if content:
            content_type, content_string = content.split(',')
            decoded = base64.b64decode(content_string)
            query = parse_uploaded_file(decoded, filename)
        
        # Default query - word vector generated from a uniform distribution
        else:
            np.random.seed(101) 
            query = np.random.uniform(-3,3,(1, 300))

        return json.dumps(query.tolist()), dash.no_update, False
    
    except Exception as e:
        return dash.no_update, str(e), True