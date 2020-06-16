import json

import dash
import dash_bootstrap_components as dbc
import dash_core_components as dcc
import dash_cytoscape as cyto
import dash_html_components as html
import dash_table as dt
from dash.dependencies import Input, Output, State

from journal_rec_components import (
    generate_graph, 
    displayTapNodeData,
    update_output
)

# Load up the style sheets for the dash app
# Uses bootstrap until noted otherwise
external_stylesheets = [dbc.themes.BOOTSTRAP]
app = dash.Dash(__name__, external_stylesheets=external_stylesheets)
app.title = "Journal Recommender"

# Add components for the app to render
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
                multiple=False,
            ),
            md=6
        ),
        html.Div(id="query", hidden=True),
        dbc.Alert(
            id="err", 
            color="danger", 
            is_open=False, 
            dismissable=True
        )
    ]),
    dbc.Row([
        dbc.Col(
            cyto.Cytoscape(
                id='paper_paper_graph',
                layout={
                    "name":"circle"
                },
                style={'width': '100%', 'height': '760px'},
                stylesheet=json.load(open('styles/paper_network.json', 'r')),
                elements=[]
            ),
            md=6
        ),
        dbc.Col(
            dt.DataTable(id="node_metadata"), 
            md=2
        ),
    ])
])

# Add graph render functionality
app.callback(
    Output(component_id="paper_paper_graph", component_property="elements"),
    [
        Input(component_id="query", component_property="children"),
    ],
)(generate_graph)

# Add table render functionality
app.callback(
    [
        Output('node_metadata', 'columns'),
        Output('node_metadata', 'data')
    ],
    [
        Input('paper_paper_graph', 'mouseoverNodeData')
    ]
)(displayTapNodeData)

# Add file upload functionality
app.callback(
    [
        Output('query', 'children'),
        Output('err', 'children'),
        Output('err', "is_open")
    ],
    [
        Input('upload-article', 'contents')
    ],
    [
        State('upload-article', 'filename'),
        State('upload-article', 'last_modified')
    ]
)(update_output)

# run the app
if __name__=='__main__':
    app.run_server(debug=True)
