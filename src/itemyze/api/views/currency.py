from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from ..tools.splitwise import get_sw_currencies, get_sw_currency_unit


@api_view(["GET"])
def get_currencies(_):
    return Response(get_sw_currencies(), status=status.HTTP_200_OK)


@api_view(["GET"])
def get_currency_unit(request):
    currency_code = request.GET.get("currencyCode")
    unit = get_sw_currency_unit(currency_code=currency_code)

    return Response({"data": unit}, status=status.HTTP_200_OK)
