from settings import CACHE_TTL
from lru_ttl import timed_lru_cache
import requests
from flask_restful import abort
from utils import server_log

@timed_lru_cache(ttl=CACHE_TTL)
def get_doi_content(user_doi):
    """
    This function is designed to render the paper-journal
    network for the user given a biorxiv doi
    Args:
        user_doi - a biorxiv doi that grabs the most current version of a preprint
    """

    # Try pinging biorxiv server first
    content = ping_biorxiv_or_medrxiv(user_doi, server="biorxiv")
    doc_url = f"http://biorxiv.org/content"

    # If no match found try medrxiv
    if content is None:
        content = ping_biorxiv_or_medrxiv(user_doi, server="medrxiv")
        doc_url = f"http://medrxiv.org/content"

        # If no match at all then raise the red flag
        if content is None:
            message = f"Cannot find document {user_doi} in either biorxiv or medrxiv."
            server_log(f"{message}\n")
            abort(404, message=message)

    latest_paper = content["collection"][-1]

    paper_metadata = {
        "title": latest_paper["title"],
        "authors": latest_paper["authors"],
        "doi": latest_paper["doi"],
        "accepted_date": latest_paper["date"],
        "publisher": "Cold Spring Harbor Laboratory",
    }

    # Grab latest version of the XML file if available
    accepted_date = latest_paper["date"].replace("-", "/")
    file_url = f"{doc_url}/early/{accepted_date}/{user_doi.split('/')[-1]}.source.xml"
    xml_found = False

    try:
        response = requests.get(file_url)
        if response.status_code == 200:
            xml_found = True

    except Exception as e:
        message = f"Cannot connect to {file_url}"
        server_log(f"{message}: {e}\n")

    # If xml not found then use PDF version
    if not xml_found:

        # Grab latest version of PDF file
        file_url = f"{doc_url}/{user_doi}v{latest_paper['version']}.full.pdf"
        try:
            response = requests.get(file_url)
        except Exception as e:
            message = f"Cannot connect to {file_url}"
            server_log(f"{message}: {e}\n")
            abort(404, message=message)

    if response.status_code != 200:
        message = f"Invalid response from {file_url}"
        server_log(f"{message}\n")
        abort(response.status_code, message=message)

    return response.content, paper_metadata, xml_found


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

    if len(content["collection"]) < 1:
        return None

    return content
