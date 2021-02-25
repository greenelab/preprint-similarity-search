from flask import Flask
from flask_cors import CORS
from flask_restful import Resource, Api
from find_knn import get_neighbors


# Sentry config
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="https://b1183a2fe86f4a8f951e9bb67341c07f@o7983.ingest.sentry.io/5407669",
    integrations=[FlaskIntegration()],
)


# Create app
app = Flask(__name__)
CORS(app)
api = Api(app)


# Quick test
@app.route("/")
def index():
    return "Hello from API server\n"


class JournalRecommendation(Resource):
    def get(self, user_doi):
        neighbors = get_neighbors(user_doi)
        return neighbors


api.add_resource(JournalRecommendation, "/doi/<path:user_doi>")


# Sentry verification
@app.route("/debug-sentry")
def trigger_error():
    division_by_zero = 1 / 0


if __name__ == "__main__":
    app.run()
