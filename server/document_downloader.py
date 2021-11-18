import datetime
import lxml.etree as ET
import re
import requests

import cachetools.func
from settings import CACHE_TTL_SECS, CACHE_MAX_SIZE
from flask_restful import abort
from utils import server_log


@cachetools.func.ttl_cache(ttl=CACHE_TTL_SECS, maxsize=CACHE_MAX_SIZE)
def get_doi_content(user_doi):
    """
    This function is designed to render the paper-journal
    network for the user given identifier.

    Code Grabs the latest preprint version to generate results.

    Args:
        user_doi - user provided biorxiv/medrxiv doi or arxiv id
    """

    # create flag if xml is found
    xml_found = False

    # Check to see if user_doi is a biorxiv/medrxiv doi
    # if not then resort to searching for arxiv
    bio_med_rxiv = re.search(r"10\.1101\/", user_doi) is not None

    if bio_med_rxiv:
        # Try pinging biorxiv server first
        content = ping_biorxiv_or_medrxiv(user_doi, server="biorxiv")
        doc_url = f"http://biorxiv.org/content"

        # If no match found try medrxiv
        if content is None:
            content = ping_biorxiv_or_medrxiv(user_doi, server="medrxiv")
            doc_url = f"http://medrxiv.org/content"

            # If no match at all then raise the red flag
            if content is None:
                message = (
                    f"Cannot find document {user_doi} in either biorxiv or medrxiv."
                )
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
        file_url = (
            f"{doc_url}/early/{accepted_date}/{user_doi.split('/')[-1]}.source.xml"
        )

    # If not arxiv definitely bioRxiv/medRxiv
    else:
        doc_url = f"https://export.arxiv.org/api/query?id_list={user_doi}"
        response = requests.get(doc_url)

        # If document cannot be found in arxiv log and report
        if response is None:
            message = f"Cannot reach arxiv api server."
            server_log(f"{message}\n")
            abort(404, message=message)

        latest_paper, latest_file_url = parse_arxiv_output(response.text)

        if latest_paper == None:
            message = f"Cannot find {user_doi} on arxiv's api server."
            server_log(f"{message}\n")
            abort(404, message=message)

        # I doubt this will execute but
        # there could be a case where a document's download link cannot be found
        if latest_file_url == None:
            message = f"Cannot find download link for {user_doi} on arxiv's api server."
            server_log(f"{message}\n")
            abort(404, message=message)

        paper_metadata = {
            "title": latest_paper["title"],
            "authors": latest_paper["authors"],
            "doi": user_doi,
            "accepted_date": latest_paper["date"],
            "publisher": "Arxiv - Cornell Univeristy",
        }

    # biorxiv has xml files available
    # This block here is designed to first attempt to retrieve the xml file
    # then defaults to pdf if xml cannot be found
    # Arxiv only has pdf so can skip this section
    if bio_med_rxiv:
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
        file_url = (
            f"{doc_url}/{user_doi}v{latest_paper['version']}.full.pdf"
            if bio_med_rxiv
            else f"https://export.arxiv.org/pdf/{latest_file_url}"
        )

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


def parse_arxiv_output(xml_feed):
    """
    This function is designed to parse output from the arxiv server

    Args:
        xml_feed - the xml output obtained from export.arxiv.org api server
    """

    arxiv_api_xml_obj = ET.fromstring(str.encode(xml_feed))

    # Extract the metadata
    title = arxiv_api_xml_obj.xpath(
        '/*[local-name()="feed"]/*[local-name()="entry"]'
        '/*[local-name()="title"]/text()'
    )[0]

    # Arxiv server reports back an error if document cannnot be found
    # this circumvents the rest of the code if the document cannot be found
    if title == "Error":
        return None, None

    # Remove pesky newlines for title if present
    title = title.replace("\n", "")

    authors = arxiv_api_xml_obj.xpath(
        '/*[local-name()="feed"]/*[local-name()="entry"]'
        '/*[local-name()="author"]/*[local-name()="name"]/text()'
    )
    authors = ";".join(authors)

    accepted_date = arxiv_api_xml_obj.xpath(
        '/*[local-name()="feed"]/*[local-name()="entry"]'
        '/*[local-name()="published"]/text()'
    )[0]

    accepted_date = datetime.datetime.strptime(
        accepted_date, "%Y-%m-%dT%H:%M:%SZ"
    ).strftime("%Y-%m-%d")

    file_url = arxiv_api_xml_obj.xpath(
        '/*[local-name()="feed"]/*[local-name()="entry"]'
        '/*[local-name()="link"][@type="application/pdf"]'
    )[0]

    latest_file_version = file_url.attrib["href"].split("/")[-1]

    return dict(title=title, date=accepted_date, authors=authors), latest_file_version


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
