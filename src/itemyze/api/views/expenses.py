from rest_framework import generics
from rest_framework import filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Expense, Item
from ..serializers import ExpenseSerializer, ItemSerializer
from ..tools.splitwise import get_sw_groups, get_sw_group, get_sw_currency_unit


class ExpenseList(generics.ListCreateAPIView):
    """
    List all expenses or create a new expense.

    GET: Retrieve all expenses or filter by query params
    POST: Create a new expense
    """

    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        response_data = serializer.data

        # Add Splitwise group names
        group_names = {group["id"]: group["name"] for group in get_sw_groups()}
        for expense in response_data:
            expense["splitwise_group_name"] = group_names[expense["splitwise_group"]]

        return Response(response_data)

    def perform_create(self, serializer):
        serializer.save()


class ExpenseDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an expense.

    GET: Retrieve a specific expense
    PUT/PATCH: Update an expense
    DELETE: Delete an expense
    """

    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        response_data = serializer.data

        # Add additional Splitwise data
        group = get_sw_group(instance.splitwise_group)
        response_data["splitwise_group_name"] = group["name"]
        response_data["currency_unit"] = get_sw_currency_unit(response_data["currency"])

        return Response(response_data)


class ItemList(generics.ListCreateAPIView):
    """
    List all items or create a new item.

    GET: Retrieve all items or filter by query params
    POST: Create a new item
    """

    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "description"]

    def get_queryset(self):
        queryset = Item.objects.all()
        expense_id = self.request.query_params.get("expenseId")
        if expense_id:
            queryset = queryset.filter(expense_id=expense_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ItemDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an item.

    GET: Retrieve a specific item
    PUT/PATCH: Update an item
    DELETE: Delete an item
    """

    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]
