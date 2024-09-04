from django.urls import path
from . import views

urlpatterns = [
    path("get_groups", views.get_groups, name="get_groups"),
    path("process_receipt", views.process_receipt, name="process_receipt"),
]
