from rest_framework import serializers

from .models import Expense, Item, Allocation

class ExpenseSerializer(serializers.ModelSerializer):
    receipt_status_label = serializers.SerializerMethodField(read_only=True)
    sync_status_label = serializers.SerializerMethodField(read_only=True)

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
            'created_on',
            'last_modified'
        ]

    def get_receipt_status_label(self, obj):
        return obj.get_receipt_status_display() if hasattr(obj, 'receipt_status') else ""

    def get_sync_status_label(self, obj):
        return obj.get_sync_status_display() if hasattr(obj, 'sync_status') else ""
    

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item

        fields = ['id','name','cost']


class AllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Allocation

        fields = ['id','splitwise_user','amount','expense']


