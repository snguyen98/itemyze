from PIL import Image
from decimal import Decimal
from django.conf import settings

import re
import pytesseract as pt
import cv2
import numpy as np

def apply_ocr(img_path: str, currency: str) -> tuple[list, float]:
    res = process_image(image_path=img_path)
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

            name = re.sub(r"[^\w]", " ", line[:cost_start]).strip()
            cost = Decimal(re.sub(r"[^\d.]", "", line[cost_start:cost_end]))

            if "total" in name.lower():
                total = cost
            else:
                items.append({"name": name, "cost": cost})

    return items, total


def clean_items(items, total) -> list:
    for item in items:
        if item["cost"] > total:
            items.remove(item)

    return items

def standardize_image(image_path, output_path=None, enhance=False):
    """
    Standardize an image for better Tesseract OCR results.
    
    Args:
        image_path (str): Path to input image
        output_path (str, optional): Path to save standardized image
        enhance (bool): Whether to apply OCR enhancements
    
    Returns:
        PIL.Image: Standardized image object
    """
    try:
        # Open image with PIL (handles most formats including HEIC from iPhones)
        img = Image.open(image_path)
        
        # Convert to RGB if needed (removes alpha channel, handles CMYK, etc.)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Handle EXIF rotation (important for mobile photos)
        try:
            from PIL.ExifTags import ORIENTATION
            exif = img._getexif()
            if exif is not None:
                for tag, value in exif.items():
                    if tag == ORIENTATION:
                        if value == 3:
                            img = img.rotate(180, expand=True)
                        elif value == 6:
                            img = img.rotate(270, expand=True)
                        elif value == 8:
                            img = img.rotate(90, expand=True)
        except:
            pass  # If EXIF handling fails, continue without rotation
        
        if enhance:
            img = enhance_for_ocr(img)
        
        # Save as high-quality PNG (lossless, well-supported by Tesseract)
        if output_path:
            img.save(output_path, 'PNG', quality=100, optimize=False)
        
        return img
        
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return None

def enhance_for_ocr(img):
    """
    Apply OCR-specific enhancements to improve text recognition.
    """
    # Convert PIL to OpenCV format for advanced processing
    cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    
    # Convert to grayscale
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    
    # Apply noise reduction
    denoised = cv2.fastNlMeansDenoising(gray)
    
    # Enhance contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(denoised)
    
    # Apply sharpening
    kernel = np.array([[-1,-1,-1],
                      [-1, 9,-1],
                      [-1,-1,-1]])
    sharpened = cv2.filter2D(enhanced, -1, kernel)
    
    # Convert back to PIL
    return Image.fromarray(sharpened)

def process_image(image_path, preprocess=True):
    """
    Process an image with Tesseract OCR, with optional preprocessing.
    
    Args:
        image_path (str): Path to image file
        preprocess (bool): Whether to standardize the image first
    
    Returns:
        str: Extracted text
    """
    try:
        if preprocess:
            # Standardize the image
            img = standardize_image(image_path)
            if img is None:
                return "Error: Could not process image"
        else:
            img = Image.open(image_path)

        # Set the path for Tesseract
        pt.pytesseract.tesseract_cmd = getattr(settings, "TESSERACT_PATH", None)
        
        # Use environment variable for Tesseract config
        tesseract_config = getattr(settings, "TESSERACT_CONF", '--oem 3 --psm 6')
        
        # Extract text
        text = pt.image_to_string(img, config=tesseract_config)
        return text.strip()
        
    except Exception as e:
        return f"Error: {e}"