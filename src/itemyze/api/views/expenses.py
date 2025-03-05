from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from ..models import Allocation, Expense, Item
from ..tools.splitwise import get_sw_groups, get_sw_group, get_sw_currency_unit
from ..tools.splitwise import create_expense, update_expense
from ..serializers import AllocationSerializer, ExpenseSerializer, ItemSerializer


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
            # Retrieve a specific expense
            try:
                expense = Expense.objects.get(id=id)
            except Expense.DoesNotExist:
                return Response({"error": "Expense not found."}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = ExpenseSerializer(expense)
            response_data = serializer.data

            group = get_sw_group(expense.splitwise_group)
            response_data["splitwise_group_name"] = group["name"]
            response_data["currency_unit"] = get_sw_currency_unit(response_data["currency"])

            return Response(response_data)

        # Retrieve all expenses or filter by query parameters
        expenses = Expense.objects.all()
        serializer = ExpenseSerializer(expenses, many=True)
        response_data = serializer.data

        group_names = { group["id"]: group["name"] for group in get_sw_groups()}
        
        for expense in response_data:
            expense["splitwise_group_name"] = group_names[expense["splitwise_group"]]

        return Response(serializer.data)

    elif request.method == 'POST':
        if id:
            # Update an existing expense
            try:
                expense = Expense.objects.get(id=id)
            except Expense.DoesNotExist:
                return Response({"error": "Expense not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer = ExpenseSerializer(expense, data=request.data, partial=True)  # Allows partial updates
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            # Create a new expense
            serializer = ExpenseSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def item_list(request, id=None):
    """
    Handles:
    - GET /items → Retrieve a list of all items or filter via query params.
    - GET /item/{id} → Retrieve a specific item.
    - POST /items → Create a new item.
    """
    if request.method == 'GET':
        if id:
            # Retrieve a specific item
            try:
                item = Item.objects.get(id=id)
            except Item.DoesNotExist:
                return Response({"error": "Item not found."}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = ItemSerializer(item)
            response_data = serializer.data

            return Response(response_data)

        expense_id = request.GET.get("expenseId")

        if expense_id:
            # Retrieve items associated with Expense ID
            items = Item.objects.filter(expense_id=expense_id)
        else:
            # Retrieve all items
            items = Item.objects.all()

        serializer = ItemSerializer(items, many=True)

        return Response(serializer.data)

    elif request.method == 'POST':
        if id:
            # Update an existing item
            try:
                item = Item.objects.get(id=id)
            except Item.DoesNotExist:
                return Response({"error": "Item not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer = ItemSerializer(item, data=request.data, partial=True)  # Allows partial updates
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            # Create a new item
            serializer = ItemSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

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
        res = update_expense(id=id, payload=payload)

    else:
        res = create_expense(payload=payload)

    if not res["errors"]:
        return Response({"message": f"Expense data sent to splitwise: {res["expenses"][0]["id"]}"}, status=status.HTTP_200_OK)
    
    else:
        return Response({"error": res["errors"]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)