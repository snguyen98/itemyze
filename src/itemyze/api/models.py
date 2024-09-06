from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.
class Expense(models.Model):
    class Status(models.IntegerChoices):
        NEW = 1, _("New")                   # No receipt processed
        PROCESSED = 2, _("Processed")       # Receipt processed by OCR
        UPLOADED = 3, _("Uploaded")         # Expense uploaded to Splitwise
        DELETED = 4, _("Deleted")           # Expense deleted from Splitwise

    name = models.CharField(max_length=255, blank=True)
    sw_id = models.IntegerField(null=True)
    status = models.IntegerField(
        choices=Status.choices,
        default=Status.NEW,
    )
    sw_user = models.IntegerField()
    sw_group = models.IntegerField()
    total = models.DecimalField(max_digits=11, decimal_places=2, null=True)

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
    sw_user = models.IntegerField()
    cost = models.DecimalField(max_digits=11, decimal_places=2, null=True)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)

    def clean(self):
        item_cost = getattr(self.item, "cost")

        if self.cost > item_cost:
            from django.core.exceptions import ValidationError
            msg = "Allocation cost cannot be greater than item cost"

            raise ValidationError(msg)
