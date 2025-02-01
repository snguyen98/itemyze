from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.http import JsonResponse

from json import loads

from ..models import Expense, Item
from ..tools.splitwise import get_sw_groups, get_sw_group_members, get_sw_group_name
from ..tools.splitwise import get_sw_currencies, get_sw_currency_unit

def set_group(request):
    if request.method == 'POST':
        expense_id = request.POST.get("expenseId")
        group_id = request.POST.get("groupId")

        Expense.objects.filter(id=expense_id).update(sw_group_id=group_id)

        return JsonResponse({ "message": "Success" })

    else:
        return JsonResponse(status=400, data={ "status": "false", "message": "Request must be POST for this endpoint" })


def get_group_name(request):
    group_id = request.GET.get("group_id")
    name = get_sw_group_name(id=group_id)

    return JsonResponse({"data": name})



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