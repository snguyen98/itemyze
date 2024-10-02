from PIL import Image
from decimal import Decimal
from django.conf import settings

import re
import pytesseract as pt

def apply_ocr(img_path: str, currency: str) -> tuple[list, float]:
    tesseract_path = getattr(settings, "TESSERACT_PATH", None)
    conf = getattr(settings, "TESSERACT_CONF", None)

    pt.pytesseract.tesseract_cmd = tesseract_path
    img = Image.open(img_path)
    
    res = pt.image_to_string(img, config=conf)
    items, total = split_item_cost(lines=res.split("\n"), currency=currency)

    if total is not None:
        items = clean_items(items, total)

    return items, total


def split_item_cost(lines: list, currency: str) -> tuple[list, float]:
    pattern = f"(\d*,?)*\.?\d*{currency}(\d*,?)*\.?\d*(?!.*(\d*,?)*\.?\d*{currency}(\d*,?)*\.?\d*)"

    items = []
    total = None

    for line in lines:
        if currency in line:
            cost_start, cost_end = re.search(pattern, line).span()

            name = re.sub(r'[^\w]', ' ', line[:cost_start]).strip()
            cost = Decimal(re.sub(r'[^\d.]', '', line[cost_start:cost_end]))

            if "total" in name.lower():
                total = cost
            else:
                items.append({ "name": name, "cost": cost })

    return items, total


def clean_items(items, total) -> list:
    for item in items:
        if item["cost"] > total:
            items.remove(item)

    return items