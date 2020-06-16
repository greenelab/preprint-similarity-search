import json
from pathlib import Path

import dash
import dash_bootstrap_components as dbc
import dash_core_components as dcc
import dash_cytoscape as cyto
import dash_html_components as html
import dash_table as dt
from dash.dependencies import Input, Output, State

import numpy as np
import pandas as pd

from journal_rec_models import get_neighbors

external_stylesheets = [dbc.themes.BOOTSTRAP]
app = dash.Dash(__name__, external_stylesheets=external_stylesheets)
app.title = "Journal Recommender"


app.layout = html.Div([
    dbc.Container([
        dcc.Markdown(
            '''
            # Journal Recommender
            Give a paper and we will give back to most appropiate journal.
            '''
        )
    ]),
    dbc.Row([
        dbc.Col(
            dcc.Upload(
                id='upload-article',
                children=html.Div([
                    'Drag and Drop or ',
                    html.A('Select Files')
                ]),
                style={
                    'width': '100%',
                    'height': '60px',
                    'lineHeight': '60px',
                    'borderWidth': '1px',
                    'borderStyle': 'dashed',
                    'borderRadius': '5px',
                    'textAlign': 'center',
                    'margin': '10px'
                },
                # Allow multiple files to be uploaded
                multiple=False
            ),
            md=6
        ),
        html.P(id="test")
    ]),
    dbc.Row([
        dbc.Col(
            cyto.Cytoscape(
                id='paper_paper_graph',
                layout={
                    "name":"circle"
                },
                style={'width': '100%', 'height': '720px'},
                stylesheet=json.load(open('paper_network.json', 'r')),
                elements=[]
            ),
            md=6
        ),
        dbc.Col(
            dt.DataTable(id="node_metadata"), 
            md=6
        ),
    ])
])

@app.callback(
    Output(component_id="paper_paper_graph", component_property="elements"),
    [
        Input(component_id="submission_button", component_property="n_clicks"),
    ],
    state=[
        State(component_id="document_input", component_property="value")
    ]
)    
def generate_graph(n_clicks, doi):
    np.random.seed(101)
    query = np.random.uniform(-3,3,(1, 300))
    results = get_neighbors(query)
    
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

@app.callback(
    [
        Output('node_metadata', 'columns'),
        Output('node_metadata', 'data')
    ],
    [
        Input('paper_paper_graph', 'mouseoverNodeData')
    ]
)
def displayTapNodeData(data):
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

@app.callback(Output('test', 'children'),
              [Input('upload-article', 'contents')],
              [State('upload-article', 'filename'),
               State('upload-article', 'last_modified')])
def update_output(list_of_contents, list_of_names, list_of_dates):
    print(list_of_contents)
    print(list_of_names)
    print(list_of_dates)
    return dash.no_update

if __name__=='__main__':
    app.run_server(debug=True)
