from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.http import JsonResponse
from django.core.files.storage import FileSystemStorage
from django.conf import settings

from json import loads
from os import path, remove

from ..models import Expense, Item
from ..tools.splitwise import get_sw_currencies, get_sw_currency_unit
from ..tools.tesseract import apply_ocr

def process_receipt(request):
    if request.method == 'POST':
        expense_id = request.POST.get("expense_id")
        currency = request.POST.get("currency")
        img = request.FILES.get("receipt")
        folder = path.join(settings.BASE_DIR, "data/temp")
        img_name = FileSystemStorage(location=folder).save(img.name, img)

        img_path = path.join(folder, img_name)

        expense = Expense.objects.get(id=expense_id)

        try:
            items, total = apply_ocr(img_path, currency)

            # Clear old items relating to the expense if they exist
            items_to_delete = Item.objects.filter(expense=expense)
            items_to_delete.delete()

            items_to_create = [Item(name=item["name"], cost=item["cost"], expense=expense) for item in items]
            Item.objects.bulk_create(items_to_create)

        except Exception as err:
            # TODO: Add logging for this error
            expense.receipt_status = Expense.ReceiptStatus.ERROR
            expense.save()
            return JsonResponse(status=500, data={"status": "false", "message": f"There was an error processing the receipt: {err}"})

        finally:
            # Cleanup files regardless of success or fail
            try:
                remove(img_path)
            except:
                pass

        expense.receipt_status = Expense.ReceiptStatus.PROCESSED
        expense.save()
        return JsonResponse({"message": f"Receipt data added to expense with ID {expense_id}"})

    else:
        return JsonResponse(status=400, data={ "status": "false", "message": "Request must be POST for this endpoint" })



def get_currencies(_):
    return JsonResponse(get_sw_currencies())

    

def get_currency_unit(request):
    currency_code = request.GET.get("currency_code")
    unit = get_sw_currency_unit(currency_code=currency_code)

    return JsonResponse({"data": unit})