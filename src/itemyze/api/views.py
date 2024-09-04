from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from django.conf import settings

from .tools.splitwise import get_sw_groups
from .tools.tesseract import apply_ocr

import os
# Create your views here.

def get_groups(_):
    groups = [{ "id": group["id"], "name": group["name"] } for group in get_sw_groups()]

    return JsonResponse({ "groups": groups })

@csrf_exempt
def process_receipt(request):
    if request.method == 'POST':
        img = request.FILES.get("receipt")
        currency = request.POST.get("currency")
        folder = os.path.join(settings.BASE_DIR, "data/temp")
        img_name = FileSystemStorage(location=folder).save(img.name, img)

        img_path = os.path.join(folder, img_name)
        items, total = apply_ocr(img_path, currency)

        try:
            os.remove(img_path)
        except:
            pass

    return JsonResponse({ "items": items, "total": total, "currency": currency })