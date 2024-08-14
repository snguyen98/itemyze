from oauthlib.oauth2 import BackendApplicationClient
from requests_oauthlib import OAuth2Session
from flask import current_app
import yaml
import json

def get_oauth_session():
    client_id = current_app.config["SW_API_KEY"]
    client_secret = current_app.config["SW_API_SECRET"]
    token_url = current_app.config["SW_TOKEN_URL"]

    client = BackendApplicationClient(client_id=client_id)
    oauth = OAuth2Session(client=client)

    _ = oauth.fetch_token(token_url=token_url, 
                          client_id=client_id, 
                          client_secret=client_secret, 
                          include_client_id=True)
    
    return oauth


def get_sw_groups():
    session = get_oauth_session()

    res = session.get('https://secure.splitwise.com/api/v3.0/get_groups')
    groups = json.loads(res.content)["groups"]

    return groups