from flask import Flask, g, request, render_template
import yaml

from itemyze.tools.splitwise import get_sw_groups
from forms.upload_receipt_form import UploadReceipt

from config import Config

app = Flask(__name__)
app.config.from_object(Config)

@app.route("/", methods=("GET", "POST"))
def index():
    groups = [(group["id"], group["name"]) for group in get_sw_groups()]
    groups.insert(0, (-1, "Please select a group"))

    form = UploadReceipt(request.form)

    form.group.choices = groups
    return render_template("index.html", form=form)
