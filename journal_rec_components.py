import base64
import json

import dash
import numpy as np
import pandas as pd
import requests

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

def parse_output(n_clicks, user_doi):
    """
    This function is designed to render the paper-journal 
    network for the user given a biorxiv doi
    
    Args:
        n_clicks - the number of times the button has been clicked
        user_doi - a biorxiv doi that grabs the most current version of a preprint
    """
    try:
        if n_clicks:
            r = requests.get(f"https://api.biorxiv.org/details/biorxiv/{user_doi}")
            
            if r.status_code != 200:
                raise Expcetion("Error DOI not found in bioRxiv. Please retry with a new DOI!")
            # grab latest version
            print(r.json())
            latest_version = r.json()['collection'][-1]['version']
            r = requests.get(f"http://biorxiv.org/content/{user_doi}v{latest_version}.full.pdf")
            print(f"http://biorxiv.org/content/{user_doi}v{latest_version}.full.pdf")
            
            if r.status_code != 200:
                raise Expcetion("Error retrieving full PDF. Please retry with a new DOI!")
                
            query = parse_uploaded_file(r.content)
        else:
            np.random.seed(101) 
            query = np.random.uniform(-3,3,(1, 300))

        return json.dumps(query.tolist()), dash.no_update, False
    
    except Exception as e:
        return dash.no_update, str(e), True