from oauthlib.oauth2 import BackendApplicationClient
from requests_oauthlib import OAuth2Session
from django.conf import settings
import json

def get_oauth_session():
    client_id = getattr(settings, "SW_API_KEY", None)
    client_secret = getattr(settings, "SW_API_SECRET", None)
    token_url = getattr(settings, "SW_TOKEN_URL", None)

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