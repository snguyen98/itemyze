from django.contrib import admin

from .models import Expense, Item, Allocation

class ExpenseAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'currency',
        'total',
        'receipt_status',
        'sync_status',
        'splitwise_id'
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
        'splitwise_user',
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
