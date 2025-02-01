from rest_framework import serializers

from .models import Expense, Item
from .tools.splitwise import get_sw_group_name

class ExpenseSerializer(serializers.ModelSerializer):
    receipt_status = serializers.SerializerMethodField()
    sync_status = serializers.SerializerMethodField()
    splitwise_group = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = [
            'id',
            'name',
            'total',
            'currency',
            'receipt_status',
            'sync_status',
            'splitwise_id',
            'splitwise_group',
            'created_on',
            'last_modified'
        ]

    def get_receipt_status(self, obj):
        return obj.get_receipt_status_display()

    def get_sync_status(self, obj):
        return obj.get_sync_status_display()
    
    def get_splitwise_group(self, obj):
        return get_sw_group_name(id=obj.splitwise_group)
    

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item

        fields = ['id','name','cost']