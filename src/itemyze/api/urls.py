from django.urls import path
from . import views

urlpatterns = [
    path("get_groups", views.get_groups, name="get_groups"),
    path("process_receipt", views.process_receipt, name="process_receipt"),
    path("get_expense", views.get_expense, name="get_expense"),
    path("get_currencies", views.get_currencies, name="get_currencies"),
    path("get_expenses", views.get_expenses, name="get_expenses"),
    path("set_group", views.set_group, name="set_group"),
    path("save_allocations", views.save_allocations, name="save_allocations"),
    path("create_expense", views.create_expense, name="create_expense"),
    path("get_currency_unit", views.get_currency_unit, name="get_currency_unit"),
    path("get_group_name", views.get_group_name, name="get_group_name"),
]
