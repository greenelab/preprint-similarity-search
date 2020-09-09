import requests
from flask_restful import abort
#from utils import server_log

def get_doi_content(user_doi):
    """
    This function is designed to render the paper-journal
    network for the user given a biorxiv doi

    Args:
        user_doi - a biorxiv doi that grabs the most current version of a preprint
    """
    
    # Try pinging biorxiv server first
    content = ping_biorxiv_or_medrxiv(user_doi, server="biorxiv")
    pdf_url = f"http://biorxiv.org/content"
    
    # If no match found try medrxiv
    if content is None: 
        content = ping_biorxiv_or_medrxiv(user_doi, server="medrxiv")
        pdf_url = f"http://medrxiv.org/content"

        # If no match at all then raise the red flag
        if content is None:
            message = f"Cannot find document {user_doi} in either biorxiv nor medrxiv."
            server_log(f"{message}\n")
            abort(404, message=message)
    
    # Grab latest version of PDF file
    latest_version = content['collection'][-1]['version']
    pdf_url = f"{pdf_url}/{user_doi}v{latest_version}.full.pdf"
    try:
        response = requests.get(pdf_url)
    except Exception as e:
        message = f"Cannot connect to {pdf_url}"
        server_log(f"{message}: {e}\n")
        abort(404, message=message)

    if response.status_code != 200:
        message = f"Invalid response from {pdf_url}"
        server_log(f"{message}\n")
        abort(response.status_code, message=message)

    return response.content

def ping_biorxiv_or_medrxiv(doi, server="biorxiv"):
    """
    This function pings biorxiv or medrxiv to see if doi exists
    within their repository
    
    Args:
        doi - a doi that grabs the most current version of a preprint
    """
    api_url = f"https://api.biorxiv.org/details/{server}/{doi}"
    
    try:
        response = requests.get(api_url)
    except Exception as e:
        message = f"Cannot connect to {api_url}"
        server_log(f"{message}: {e}\n")
        abort(404, message=message)

    if response.status_code != 200:
        message = f"Invalid response from {api_url}"
        server_log(f"{message}\n")
        abort(response.status_code, message=message)
    
    try:
        content = response.json()
    except Exception as e:
        message = f"Cannot convert response from {api_url} to json format"
        server_log(f"{message}: {e}\n")
        abort(404, message=message)

    if len(content['collection']) < 1:
        return None
    
    return content
