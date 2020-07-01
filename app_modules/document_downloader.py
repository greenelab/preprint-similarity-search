from flask_restful import abort
import requests

def parse_biorxiv_document(user_doi):
    """
    This function is designed to render the paper-journal 
    network for the user given a biorxiv doi
    
    Args:
        user_doi - a biorxiv doi that grabs the most current version of a preprint
    """
    response = requests.get(
        f"https://api.biorxiv.org/details/biorxiv/{user_doi}"
    )

    if response.status_code != 200:
        abort(
            response.status_code, 
            message="Something went wrong!"
        )

    content = response.json()
    print(content)
    
    if len(content['collection']) < 1:
        abort(
            404, 
            message=f"Error cannot find bioRxiv document: {user_doi}"
        )
        
    # grab latest version
    latest_version = content['collection'][-1]['version']
    response = requests.get(
        "http://biorxiv.org/content/"
        f"{user_doi}v{latest_version}.full.pdf"
    )

    print(
        "http://biorxiv.org/content/"
        f"{user_doi}v{latest_version}.full.pdf"
    )

    if response.status_code != 200:
        abort(
            response.status_code, 
            message=(
                "Something went wrong trying to download:"
                "http://biorxiv.org/content/"
                f"{user_doi}v{latest_version}.full.pdf"
            )
        )

    return response.content
