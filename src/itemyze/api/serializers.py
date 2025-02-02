from rest_framework import serializers

from .models import Expense, Item
from .tools.splitwise import get_sw_group_name

class ExpenseSerializer(serializers.ModelSerializer):
    receipt_status_label = serializers.SerializerMethodField(read_only=True)
    sync_status_label = serializers.SerializerMethodField(read_only=True)
    splitwise_group_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id',
            'name',
            'total',
            'currency',
            'receipt_status',
            'receipt_status_label',
            'sync_status',
            'sync_status_label',
            'splitwise_id',
            'splitwise_group',
            'splitwise_group_name',
            'created_on',
            'last_modified'
        ]

    def get_receipt_status_label(self, obj):
        return obj.get_receipt_status_display() if hasattr(obj, 'receipt_status') else ""

    def get_sync_status_label(self, obj):
        return obj.get_sync_status_display() if hasattr(obj, 'sync_status') else ""
    
    def get_splitwise_group_name(self, obj):
        return get_sw_group_name(id=obj.splitwise_group) if hasattr(obj, 'splitwise_group') else ""
    

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item

        fields = ['id','name','cost']