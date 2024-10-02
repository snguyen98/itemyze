from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from django.conf import settings

from .models import Expense, Item, Allocation

from .tools.splitwise import get_sw_groups, get_sw_group_members, get_sw_currencies
from .tools.tesseract import apply_ocr

import os
import json
# Create your views here.

def get_groups(_):
    groups = [{ "id": group["id"], "name": group["name"] } 
              for group in get_sw_groups()]

    return JsonResponse({ "groups": groups })

@csrf_exempt
def process_receipt(request):
    if request.method == 'POST':
        img = request.FILES.get("receipt")
        currency = request.POST.get("currency")
        folder = os.path.join(settings.BASE_DIR, "data/temp")
        img_name = FileSystemStorage(location=folder).save(img.name, img)

        img_path = os.path.join(folder, img_name)
        items, total = apply_ocr(img_path, currency)

        expense = Expense(name="Test", total=total, currency=currency)
        expense.save()

        for item in items:
            Item.objects.create(
                name=item["name"],
                cost=item["cost"],
                expense=expense
            )

        try:
            os.remove(img_path)
        except:
            pass

    return JsonResponse({ "expenseId": expense.id })


def get_expense(request):
    expense = Expense.objects.get(id=request.GET.get("expense_id"))
    items = Item.objects.filter(expense=expense)

    return JsonResponse({ 
        "items": list(items.values()), 
        "total": expense.total,
        "currency": expense.currency,
        "groupId": expense.sw_group_id
    })


def get_group_members(request):
    group_id = request.GET.get("group_id")

    members = [{ "id": member["id"], 
                 "fname": member["first_name"], 
                 "lname": str(member["last_name"] or "")} 
              for member in get_sw_group_members(group_id)]
    
    return JsonResponse({ "members": members })


def get_expenses(_):
    expenses = [{ "id": expense["id"],
                  "name": expense["name"], 
                  "currency": expense["currency"], 
                  "total": expense["total"],
                  "swGroupId": expense["sw_group_id"] } 
                 for expense in Expense.objects.all().values()]

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

