from flask import Flask
from flask_cors import CORS
from flask_restful import Resource, Api
from find_knn import get_neighbors

app = Flask(__name__)
CORS(app)
api = Api(app)


# Quick test
@app.route('/')
def index():
    return "Hello from journal-rec-app\n"


class JournalRecommendation(Resource):
    def get(self, user_doi):
        neighbors = get_neighbors(user_doi)
        return neighbors

api.add_resource(
    JournalRecommendation,
    '/doi/<path:user_doi>'
)

if __name__ == '__main__':
    app.run()
