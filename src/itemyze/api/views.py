from django.shortcuts import render
from django.http import JsonResponse

from .tools.splitwise import get_sw_groups
# Create your views here.

def index(request):
    groups = [{ "id": group["id"], "name": group["name"] } for group in get_sw_groups()]

    return JsonResponse({ "data": groups })
