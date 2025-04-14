from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.core.files.storage import FileSystemStorage
from django.conf import settings

from os import path, remove

from ..models import Expense, Item
from ..tools.tesseract import apply_ocr


@api_view(["POST"])
def process_receipt(request):
    expense_id = request.POST.get("expenseId")
    currency = request.POST.get("currency")
    img = request.FILES.get("receipt")
    folder = path.join(settings.BASE_DIR, "data/temp")
    img_name = FileSystemStorage(location=folder).save(img.name, img)

    img_path = path.join(folder, img_name)

    expense = Expense.objects.get(id=expense_id)

    try:
        items, _ = apply_ocr(img_path, currency)

        # Clear old items relating to the expense if they exist
        items_to_delete = Item.objects.filter(expense=expense)
        items_to_delete.delete()

        items_to_create = [
            Item(name=item["name"], cost=item["cost"], expense=expense)
            for item in items
        ]
        Item.objects.bulk_create(items_to_create)

    except Exception as err:
        # TODO: Add logging for this error
        expense.receipt_status = Expense.ReceiptStatus.ERROR
        expense.save()
        return Response(
            {"error": "There was an error processing the receipt."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    finally:
        # Cleanup files regardless of success or fail
        try:
            remove(img_path)
        except:
            pass

    expense.receipt_status = Expense.ReceiptStatus.PROCESSED
    expense.save()

    return Response(
        {"message": f"Receipt data added to expense with ID {expense_id}"},
        status=status.HTTP_200_OK,
    )
