from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse

from ..tools.splitwise import get_sw_groups

def get_groups(_):
    groups = [
        {
            "id": group["id"],
            "name": group["name"],
            "members": [
                {
                    "id": member["id"],
                    "fname": member["first_name"], 
                    "lname": str(member["last_name"] or ""),
                    "avatar": member["picture"]["small"]
                } for member in group["members"]
            ]
        } for group in get_sw_groups()
    ]

    return JsonResponse({ "groups": groups })