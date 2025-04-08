from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from ..models import Allocation, Expense
from ..serializers import AllocationSerializer, ExpenseSerializer
from ..tools.splitwise import create_expense, update_expense

@api_view(['POST'])
def upload_splitwise(_, id=None):
    try:
        expense = Expense.objects.get(id=id)
    except Expense.DoesNotExist:
        return Response({"error": "Expense not found."}, status=status.HTTP_404_NOT_FOUND)
    
    allocations = Allocation.objects.filter(expense_id=id)

    if not allocations.exists():
        return Response({"error": "Allocations not found."}, status=status.HTTP_404_NOT_FOUND)

    payload = {
        "description": expense.name,
        "cost": sum(a.amount for a in allocations),
        "currency_code": expense.currency,
        "group_id": expense.splitwise_group,
    }

    for index, val in enumerate(allocations):
        payload[f"users__{index}__user_id"] = val.splitwise_user
        payload[f"users__{index}__owed_share"] = val.amount
    
        payload[f"users__{index}__paid_share"] = payload["cost"] if val.splitwise_user == expense.splitwise_paid_by else 0

    if expense.splitwise_id:
        res = update_expense(id=expense.splitwise_id, payload=payload)

    else:
        res = create_expense(payload=payload)

    if not res["errors"]:
        splitwise_id = res["expenses"][0]["id"]
        expense.splitwise_id = splitwise_id
        expense.sync_status = Expense.SyncStatus.SYNCED
        expense.save()

        return Response({"message": f"Expense data sent to splitwise: {splitwise_id}"}, status=status.HTTP_200_OK)
 
    else:
        expense.sync_status = Expense.SyncStatus.ERROR
        expense.save()

        return Response({"error": res["errors"]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)