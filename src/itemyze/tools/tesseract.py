import pytesseract as pt
from PIL import Image

def process_receipt(img_path: str):
    img = Image.open(img_path)
    conf = r'--oem 3 --psm 6'

    res = pt.image_to_string(img, config=conf)
    filtered = [item.rpartition(" ") for item in res.split("\n") if "£" in item]

    return filtered