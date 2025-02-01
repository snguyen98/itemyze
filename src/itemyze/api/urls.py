from django.urls import path
from .views import create_expense, get_expense, get_expenses, edit_item, expense_list
from .views import get_group_name, set_group, get_groups
from .views import save_allocations
from .views import process_receipt, get_currencies, get_currency_unit

urlpatterns = [
    path("get_groups", get_groups, name="get_groups"),
    path("process_receipt", process_receipt, name="process_receipt"),
    path("get_expense", get_expense, name="get_expense"),
    path("get_currencies", get_currencies, name="get_currencies"),
    path("get_expenses", get_expenses, name="get_expenses"),
    path("set_group", set_group, name="set_group"),
    path("save_allocations", save_allocations, name="save_allocations"),
    path("create_expense", create_expense, name="create_expense"),
    path("get_currency_unit", get_currency_unit, name="get_currency_unit"),
    path("get_group_name", get_group_name, name="get_group_name"),
    path("edit_item", edit_item, name="edit_item"),
    path("expenses", expense_list, name="expenses_list"),
    path("expenses/<int:id>/", expense_list, name="expenses_detail"),
]