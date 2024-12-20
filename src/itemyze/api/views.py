from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from django.conf import settings

from .models import Expense, Item, Allocation

from .tools.splitwise import get_sw_groups, get_sw_group_members, get_sw_group_name
from .tools.splitwise import get_sw_currencies, get_sw_currency_unit
from .tools.tesseract import apply_ocr

import os
import json

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

@csrf_exempt
def process_receipt(request):
    if request.method == 'POST':
        expense_id = request.POST.get("expense_id")
        currency = request.POST.get("currency")
        img = request.FILES.get("receipt")
        folder = os.path.join(settings.BASE_DIR, "data/temp")
        img_name = FileSystemStorage(location=folder).save(img.name, img)

        img_path = os.path.join(folder, img_name)

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
                os.remove(img_path)
            except:
                pass

        expense.receipt_status = Expense.ReceiptStatus.PROCESSED
        expense.save()
        return JsonResponse({"message": f"Receipt data added to expense with ID {expense_id}"})

    else:
        return JsonResponse(status=400, data={ "status": "false", "message": "Request must be POST for this endpoint" })


@csrf_exempt
def create_expense(request):
    body = json.loads(request.body)

    name = body["name"]
    group = body["group"]
    currency = body["currency"]

    expense = Expense(
        name=name,
        splitwise_group = group,
        currency=currency
    )

    expense.save()

    return JsonResponse({"expenseId": expense.id})



def get_expense(request):
    expense = Expense.objects.get(id=request.GET.get("expense_id"))
    items = Item.objects.filter(expense=expense)

    return JsonResponse({
        "id": expense.id,
        "name": expense.name,
        "currency": expense.currency,
        "receipt_status": expense.get_receipt_status_display(),
        "sync_status": expense.get_sync_status_display(),
        "splitwise_id": expense.splitwise_id,
        "splitwise_group": get_sw_group_name(id=expense.splitwise_group),
        #"created_by": expense.created_by,
        "items": list(items.values()),
    })


def get_group_members(request):
    group_id = request.GET.get("group_id")

    members = [{ "id": member["id"], 
                 "fname": member["first_name"], 
                 "lname": str(member["last_name"] or ""),
                 "avatar": member["picture"]["small"]}
              for member in get_sw_group_members(group_id)]
    
    return JsonResponse({ "members": members })


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


def get_currencies(_):
    return JsonResponse(get_sw_currencies())


@csrf_exempt
def set_group(request):
    if request.method == 'POST':
        expense_id = request.POST.get("expenseId")
        group_id = request.POST.get("groupId")

        Expense.objects.filter(id=expense_id).update(sw_group_id=group_id)

        return JsonResponse({ "message": "Success" })

    else:
        return JsonResponse(status=400, data={ "status": "false", "message": "Request must be POST for this endpoint" })
    

@csrf_exempt
def save_allocations(request):
    if request.method == 'POST':
        body = json.loads(request.body)

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


@csrf_exempt
def post_expense(request):
    if request.method == 'POST':
        body = json.loads(request.body)

        expense = Expense.objects.get(id=body["expenseId"])
        allocations = Allocation.objects.get(expense=expense)


        return JsonResponse({ "message": "Success" })

    else:
        return JsonResponse(status=400, data={ "status": "false", "message": "Request must be POST for this endpoint" })
    

def get_currency_unit(request):
    currency_code = request.GET.get("currency_code")
    unit = get_sw_currency_unit(currency_code=currency_code)

    return JsonResponse({"data": unit})


def get_group_name(request):
    group_id = request.GET.get("group_id")
    name = get_sw_group_name(id=group_id)

    return JsonResponse({"data": name})

