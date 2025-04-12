from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from ..tools.splitwise import get_sw_group, get_sw_groups


@api_view(["GET"])
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
                    "avatar": member["picture"]["small"],
                }
                for member in group["members"]
            ],
        }
        for group in get_sw_groups()
    ]

    return Response(groups, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_group_members(_, id=None):
    if id:
        members = [
            {
                "id": member["id"],
                "fname": member["first_name"],
                "lname": str(member["last_name"] or ""),
                "avatar": member["picture"]["small"],
            }
            for member in get_sw_group(id)["members"]
        ]
        return Response(members, status=status.HTTP_200_OK)

    else:
        return Response(
            {"error": "Expense ID not supplied"}, status=status.HTTP_400_BAD_REQUEST
        )
