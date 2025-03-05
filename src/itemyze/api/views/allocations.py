from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from ..models import Expense, Allocation
from ..serializers import AllocationSerializer

@api_view(['GET', 'POST'])
def allocation_list(request, id=None):
    """
    Handles:
    - GET /allocations → Retrieve a list of all allocations or filter via query params.
    - GET /allocations/{id} → Retrieve a specific allocation.
    - POST /allocations → Create a new allocation.
    """
    if request.method == 'GET':
        if id:
            # Retrieve a specific allocation
            try:
                allocation = Allocation.objects.get(id=id)
            except Allocation.DoesNotExist:
                return Response({"error": "Allocation not found."}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = AllocationSerializer(allocation)
            response_data = serializer.data

            return Response(response_data)
        
        expense_id = request.GET.get("expenseId")

        if expense_id:
            # Retrieve allocations associated with Expense ID
            allocations = Allocation.objects.filter(expense_id=expense_id)
        else:
            # Retrieve all allocations
            allocations = Allocation.objects.all()
        
        serializer = AllocationSerializer(allocations, many=True)

        return Response(serializer.data)

    elif request.method == 'POST':
        # Check if request is for bulk create/update
        if isinstance(request.data["allocations"], list):  # Expecting a list of allocation objects
            expense = Expense.objects.get(id=request.data["expenseId"])

            for allocation in request.data["allocations"]:
                Allocation.objects.update_or_create(
                    splitwise_user = allocation["user"],
                    expense = expense,
                    defaults = { "amount": allocation["amount"] }
                )

            return Response({"message": "Bulk operation successful"}, status=status.HTTP_200_OK)
        
        if id:
            # Update an existing allocation
            try:
                allocation = Allocation.objects.get(id=id)
            except Allocation.DoesNotExist:
                return Response({"error": "Allocation not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer = AllocationSerializer(allocation, data=request.data, partial=True)  # Allows partial updates
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            # Create a new allocation
            serializer = AllocationSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)