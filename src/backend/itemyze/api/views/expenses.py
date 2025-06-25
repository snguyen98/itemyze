from rest_framework import generics
from rest_framework import filters
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction

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


class ItemBulkUpdate(APIView):
    """
    Replace all items tied to a given expenseId with new ones.
    Used when the user clicks "Save" in the frontend.

    POST: Accepts a list of items (some with `id`s, some new) and syncs the DB accordingly.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        expense_id = request.query_params.get("expenseId")

        if not expense_id:
            return Response({"error": "Missing expenseId"}, status=status.HTTP_400_BAD_REQUEST)

        # Filter only items belonging to this expense
        existing_items = Item.objects.filter(expense_id=expense_id)
        existing_map = {item.id: item for item in existing_items}
        incoming_ids = set()

        with transaction.atomic():
            for item_data in data:
                item_id = item_data.get("id")
                incoming_ids.add(item_id)

                if item_id and item_id in existing_map:
                    # Update if any field changed
                    item = existing_map[item_id]
                    serializer = ItemSerializer(item, data=item_data, partial=True)
                    if serializer.is_valid():
                        serializer.save()
                    else:
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    # New item: add expense_id and created_by
                    item_data["expense_id"] = expense_id
                    item_data["created_by"] = request.user.id
                    serializer = ItemSerializer(data=item_data)
                    if serializer.is_valid():
                        serializer.save()
                    else:
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Delete items that were removed
            to_delete = [item.id for item in existing_items if item.id not in incoming_ids and item.id is not None]
            if to_delete:
                Item.objects.filter(id__in=to_delete).delete()

        return Response({"status": "success"}, status=status.HTTP_200_OK)