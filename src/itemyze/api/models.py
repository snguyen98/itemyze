from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.
class Expense(models.Model):
    class ReceiptStatus(models.IntegerChoices):
        PENDING = 1, _("Pending")
        ERROR = 2, _("Error")
        PROCESSED = 3, _("Processed")
        ITEMISED = 4, _("Itemised")

    class SyncStatus(models.IntegerChoices):
        PENDING = 1, _("Pending")
        ERROR = 2, _("Error")
        SYNCED = 3, _("Synced")
        DELETED = 4, _("Deleted")

    name = models.CharField(max_length=255, blank=False)
    total = models.DecimalField(max_digits=11, decimal_places=2, null=True)
    currency = models.CharField(max_length=3)
    receipt_status = models.IntegerField(
        choices=ReceiptStatus.choices,
        default=ReceiptStatus.PENDING,
    )
    sync_status = models.IntegerField(
        choices=SyncStatus.choices,
        default=SyncStatus.PENDING,
    )
    splitwise_id = models.IntegerField(null=True)
    splitwise_group = models.IntegerField(null=False)
    created_on = models.DateField(auto_now_add=True)
    last_modified = models.DateField(auto_now=True)
    #created_by = models.ForeignKey(settings.AUTH_USER_MODEL)


class Item(models.Model):
    name = models.CharField(max_length=255)
    cost = models.DecimalField(max_digits=11, decimal_places=2, null=True)
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE)
    created_on = models.DateField(auto_now_add=True)
    last_modified = models.DateField(auto_now=True)

    def clean(self):
        total = getattr(self.expense, "total")

        if self.cost > total:
            from django.core.exceptions import ValidationError
            msg = "Item cost cannot be greater than total cost"

            raise ValidationError(msg)
        
class Allocation(models.Model):
    sw_user_id = models.IntegerField()
    amount = models.DecimalField(max_digits=11, decimal_places=2, null=True)
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE)
    created_on = models.DateField(auto_now_add=True)
    last_modified = models.DateField(auto_now=True)

    def clean(self):
        expense_total = getattr(self.expense, "total")

        if expense_total is not None and self.amount > expense_total:
            from django.core.exceptions import ValidationError
            msg = "Allocation amount cannot be greater than expense total"

            raise ValidationError(msg)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['sw_user_id', 'expense'],
                name='user_expense_unique',
            )
        ]