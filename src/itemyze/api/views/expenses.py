from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.http import JsonResponse

from json import loads

from ..models import Expense, Item
from ..tools.splitwise import get_sw_groups, get_sw_group_members, get_sw_group_name
from ..serializers import ExpenseSerializer, ItemSerializer


@api_view(['GET', 'POST'])
def expense_list(request, id=None):
    """
    Handles:
    - GET /expenses → Retrieve a list of all expenses or filter via query params.
    - GET /expenses/{id} → Retrieve a specific expense.
    - POST /expenses → Create a new expense.
    """
    if request.method == 'GET':
        if id:
            include_items = request.GET.get("includeItems", "false").lower() == "true"
            include_users = request.GET.get("includeUsers", "false").lower() == "true"

            # Retrieve a specific expense
            try:
                expense = Expense.objects.get(id=id)
            except Expense.DoesNotExist:
                return Response({"error": "Expense not found."}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = ExpenseSerializer(expense)
            response_data = serializer.data

            # If includeItems=true, fetch related items
            if include_items:
                items = Item.objects.filter(expense_id=id)
                response_data["items"] = ItemSerializer(items, many=True).data

            if include_users:
                response_data["members"] = [{ 
                    "id": member["id"], 
                    "fname": member["first_name"], 
                    "lname": str(member["last_name"] or ""),
                    "avatar": member["picture"]["small"]
                }
                for member in get_sw_group_members(expense.splitwise_group)]

            return Response(response_data)

        # Retrieve all expenses or filter by query parameters
        expenses = Expense.objects.all()
        serializer = ExpenseSerializer(expenses, many=True)

        return Response(serializer.data)

    elif request.method == 'POST':
        # Create a new expense
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def create_expense(request):
    body = request.data

    name = body["name"]
    group = body["group"]
    currency = body["currency"]

    expense = Expense(
        name=name,
        splitwise_group = group,
        currency=currency
    )

    expense.save()

    return Response(status=status.HTTP_200_OK)


def get_expense(request):
    expense = Expense.objects.get(id=request.GET.get("expense_id"))
    items = Item.objects.filter(expense=expense)

    members = [{ "id": member["id"], 
                 "fname": member["first_name"], 
                 "lname": str(member["last_name"] or ""),
                 "avatar": member["picture"]["small"]}
              for member in get_sw_group_members(id)]

    return JsonResponse({
        "id": expense.id,
        "name": expense.name,
        "currency": expense.currency,
        "receipt_status": expense.get_receipt_status_display(),
        "sync_status": expense.get_sync_status_display(),
        "splitwise_id": expense.splitwise_id,
        "splitwise_group": get_sw_group_name(id=expense.splitwise_group),
        "members": members,
        #"created_by": expense.created_by,
        "items": list(items.values()),
    })


def get_expenses(_):
    expenses = [{ "id": expense.id,
                  "name": expense.name,
                  "currency": expense.currency,
                  "receipt_status": expense.get_receipt_status_display(),
                  "sync_status": expense.get_sync_status_display(),
                  "splitwise_id": expense.splitwise_id,
                  "splitwise_group": get_sw_group_name(id=expense.splitwise_group) } 
                 for expense in Expense.objects.all()]

    return JsonResponse({ "expenses": expenses })


def edit_item(request):
    if request.method == 'POST':
        item_id = request.POST.get("itemId")
        name = request.POST.get("name")
        cost = request.POST.get("cost")

        item_to_edit = Item.objects.get(id=item_id)

        item_to_edit.name = name
        item_to_edit.cost = cost
        item_to_edit.save()

        return JsonResponse({ "message": "Success" })

    else:
        return JsonResponse(status=400, data={ "status": "false", "message": "Request must be POST for this endpoint" })