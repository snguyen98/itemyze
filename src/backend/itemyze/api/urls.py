from django.urls import path

from .views import ExpenseList, ExpenseDetail
from .views import ItemList, ItemDetail, ItemBulkUpdate
from .views import upload_splitwise
from .views import get_groups, get_group_members
from .views import allocation_list
from .views import process_receipt, get_currencies, get_currency_unit

urlpatterns = [
    path("get_groups/", get_groups, name="get_groups"),
    path("get_group_members/<int:id>/", get_group_members, name="get_group_members"),
    path("process_receipt/", process_receipt, name="process_receipt"),
    path("get_currencies/", get_currencies, name="get_currencies"),
    path("get_currency_unit/", get_currency_unit, name="get_currency_unit"),
    path("expenses/", ExpenseList.as_view(), name="expense_list"),
    path("expenses/<int:pk>/", ExpenseDetail.as_view(), name="expense_detail"),
    path("items/", ItemList.as_view(), name="item_list"),
    path("items/<int:pk>/", ItemDetail.as_view(), name="item_detail"),
    path("allocations/", allocation_list, name="allocation_list"),
    path("allocations/<int:id>/", allocation_list, name="allocation_detail"),
    path("upload_splitwise/<int:id>/", upload_splitwise, name="upload_splitwise"),
    path("items/bulk_update/", ItemBulkUpdate.as_view(), name="item_bulk_update"),
]
