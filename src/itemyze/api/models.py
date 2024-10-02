from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.
class Expense(models.Model):
    class Status(models.IntegerChoices):
        WAITING = 1, _("Waiting")
        PROCESSED = 2, _("Processed")
        DELETED = 3, _("Deleted")
        ERROR = 4, _("Error")

    name = models.CharField(max_length=255, blank=True)
    total = models.DecimalField(max_digits=11, decimal_places=2, null=True)
    currency = models.CharField(max_length=1, blank=True)
    receipt_status = models.IntegerField(
        choices=Status.choices,
        default=Status.WAITING,
    )
    upload_status = models.IntegerField(
        choices=Status.choices,
        default=Status.WAITING,
    )
    sw_expense_id = models.IntegerField(null=True)
    sw_user_id = models.IntegerField(null=True)
    sw_group_id = models.IntegerField(null=True)


class Item(models.Model):
    name = models.CharField(max_length=255)
    cost = models.DecimalField(max_digits=11, decimal_places=2, null=True)
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE)

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