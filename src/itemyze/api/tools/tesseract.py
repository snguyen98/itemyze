import pytesseract as pt
from PIL import Image
import re
from decimal import Decimal

def apply_ocr(img_path: str, currency: str) -> tuple[list, float]:
    pt.pytesseract.tesseract_cmd = r'C:/Users/sang_/Documents/Project/itemyze/src/bin/Tesseract-OCR/tesseract.exe'
    img = Image.open(img_path)
    conf = r'--oem 3 --psm 6'

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
        if item["cost"] >= total:
            items.remove(item)

    return items