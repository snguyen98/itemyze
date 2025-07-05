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

    _ = oauth.fetch_token(
        token_url=token_url,
        client_id=client_id,
        client_secret=client_secret,
        include_client_id=True,
    )

    return oauth


def get_sw_groups():
    session = get_oauth_session()

    res = session.get("https://secure.splitwise.com/api/v3.0/get_groups")
    groups = json.loads(res.content)["groups"]

    return groups


def get_sw_group(id: int):
    session = get_oauth_session()

    res = session.get(f"https://secure.splitwise.com/api/v3.0/get_group/{id}")
    group = json.loads(res.content)["group"]

    return group


def get_sw_user(id: int):
    session = get_oauth_session()

    res = session.get(f"https://secure.splitwise.com/api/v3.0/get_user/{id}")
    user = json.loads(res.content)["user"]

    return user


def get_sw_currencies():
    session = get_oauth_session()

    res = session.get(f"https://secure.splitwise.com/api/v3.0/get_currencies")
    currencies = json.loads(res.content)

    return currencies


def get_sw_currency_unit(currency_code: str):
    return next(
        (
            curr["unit"]
            for curr in get_sw_currencies()["currencies"]
            if curr["currency_code"] == currency_code
        ),
        "",
    )


def get_sw_group_name(id: int):
    session = get_oauth_session()

    res = session.get(f"https://secure.splitwise.com/api/v3.0/get_group/{id}")
    group = json.loads(res.content)["group"]

    return group["name"]


def create_expense(payload: dict):
    session = get_oauth_session()

    res = session.post(
        url="https://secure.splitwise.com/api/v3.0/create_expense", data=payload
    )

    return res.json()


def update_expense(id: int, payload: dict):
    session = get_oauth_session()

    res = session.post(
        url=f"https://secure.splitwise.com/api/v3.0/update_expense/{id}/", data=payload
    )

    return res.json()
