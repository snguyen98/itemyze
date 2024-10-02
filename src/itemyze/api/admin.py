from django.contrib import admin

from .models import Expense, Item, Allocation

class ExpenseAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'currency',
        'total',
        'receipt_status',
        'upload_status',
        'sw_expense_id',
        'sw_user_id',
        'sw_group_id',
    )

class ItemAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'cost',
        'get_expense',
    )

    def get_expense(self, obj):
        return obj.expense.id
    
    get_expense.admin_order_field  = 'expense'  #Allows column order sorting
    get_expense.short_description = 'Expense ID'

class AllocationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'sw_user_id',
        'amount',
        'get_expense',
    )

    def get_expense(self, obj):
        return obj.expense.id
    
    get_expense.admin_order_field = 'expense'  #Allows column order sorting
    get_expense.short_description = 'Expense ID'

# Register your models here.
admin.site.register(Expense, ExpenseAdmin)
admin.site.register(Item, ItemAdmin)
admin.site.register(Allocation, AllocationAdmin)
