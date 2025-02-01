from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.http import JsonResponse

from json import loads

from ..models import Expense, Allocation

def save_allocations(request):
    if request.method == 'POST':
        body = loads(request.body)

        allocations = body["allocations"]
        expense = Expense.objects.get(id=body["expenseId"])

        for allocation in allocations:
            Allocation.objects.update_or_create(
                sw_user_id = allocation["user"],
                expense = expense,
                defaults= { "amount": allocation["amount"] }
            )

        return JsonResponse({ "message": "Success" })

    else:
        return JsonResponse(status=400, data={ "status": "false", "message": "Request must be POST for this endpoint" })