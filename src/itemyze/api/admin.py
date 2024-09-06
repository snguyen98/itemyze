from django.contrib import admin

from .models import Expense, Item, Allocation

# Register your models here.
admin.site.register(Expense)
admin.site.register(Item)
admin.site.register(Allocation)
