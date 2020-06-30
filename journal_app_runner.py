from flask import Flask
from flask_restful import Resource, Api

from app_modules.document_downloader import parse_biorxiv_document
from app_modules.ml_models import get_neighbors
from app_modules.word_vectors import parse_uploaded_file

app = Flask(__name__)
api = Api(app)

class JournalRecommendation(Resource):
    def get(self, biorxiv_doi):
        content = parse_biorxiv_document(biorxiv_doi)
        vector = parse_uploaded_file(content)
        neighbors = get_neighbors(vector)
        return neighbors

api.add_resource(
    JournalRecommendation, 
    '/biorxiv_doi/<path:biorxiv_doi>'
)

if __name__ == '__main__':
    app.run(debug=True, use_evalex=False)