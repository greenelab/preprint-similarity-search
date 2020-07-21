import requests
from flask_restful import abort
from utils import server_log


def get_doi_content(user_doi):
    """
    This function is designed to render the paper-journal
    network for the user given a biorxiv doi

    Args:
        user_doi - a biorxiv doi that grabs the most current version of a preprint
    """

    api_url = f"https://api.biorxiv.org/details/biorxiv/{user_doi}"
    try:
        response = requests.get(api_url)
    except Exception as e:
        message = f"Cannot connect to {api_url}"
        server_log(f"{message}: {e}")
        abort(404, message=message)

    if response.status_code != 200:
        abort(
            response.status_code,
            message=f"Invalid response from {api_url}"
        )

    content = response.json()
    if len(content['collection']) < 1:
        abort(
            404,
            message=f"Cannot find bioRxiv document: {user_doi}"
        )

    # Grab latest version of PDF file
    latest_version = content['collection'][-1]['version']
    pdf_url = f"http://biorxiv.org/content/{user_doi}v{latest_version}.full.pdf"
    try:
        response = requests.get(pdf_url)
    except Exception as e:
        message = f"Cannot connect to {paper_url}"
        server_log(f"{message}: {e}")
        abort(404, message=message)

    if response.status_code != 200:
        abort(
            response.status_code,
            message=f"Invalid response from {pdf_url}"
        )

    return response.content
