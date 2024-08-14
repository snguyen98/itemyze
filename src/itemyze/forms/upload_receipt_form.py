from wtforms import Form, validators, SelectField, FileField
from flask import g

class UploadReceipt(Form):
    """
    Form definition for upload receipt page
    """
    group = SelectField('Splitwise Group', validators=[validators.DataRequired()])
    receipt = FileField('Upload Receipt', [validators.DataRequired()])