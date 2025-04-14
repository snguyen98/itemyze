from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from rest_framework_simplejwt.token_blacklist.models import (
    OutstandingToken,
    BlacklistedToken,
)
from django.middleware.csrf import get_token
from django.conf import settings


class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            tokens = response.data
            response = Response({"detail": "Login successful"})

            # Set HttpOnly cookies
            response.set_cookie(
                "access_token",
                tokens["access"],
                max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
                httponly=True,
                samesite=settings.CSRF_COOKIE_SAMESITE,
                secure=settings.CSRF_COOKIE_SECURE,
            )
            response.set_cookie(
                "refresh_token",
                tokens["refresh"],
                max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(),
                httponly=True,
                samesite=settings.CSRF_COOKIE_SAMESITE,
                secure=settings.CSRF_COOKIE_SECURE,
            )

            # Set CSRF cookie
            csrf_token = get_token(request)
            response.set_cookie(
                "csrftoken",
                csrf_token,
                max_age=3600 * 24 * 7,  # 7 days
                samesite=settings.CSRF_COOKIE_SAMESITE,
                secure=settings.CSRF_COOKIE_SECURE,
            )

        return response


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # Get refresh token from cookie instead of request body
        refresh_token = request.COOKIES.get("refresh_token")

        if refresh_token:
            request.data["refresh"] = refresh_token

        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access_token = response.data["access"]

            response = Response({"detail": "Token refreshed successfully"})
            response.set_cookie(
                "access_token",
                access_token,
                max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
                httponly=True,
                samesite=settings.CSRF_COOKIE_SAMESITE,
                secure=settings.CSRF_COOKIE_SECURE,
            )

        return response


class CookieTokenVerifyView(TokenVerifyView):
    """
    Takes a token from cookie and verifies it's valid.
    """

    def post(self, request, *args, **kwargs):
        # Get token from cookie instead of request body
        access_token = request.COOKIES.get("access_token")

        if access_token:
            request.data["token"] = access_token

        return super().post(request, *args, **kwargs)


class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get("refresh_token")

            if refresh_token:
                # Blacklist the token
                token = RefreshToken(refresh_token)
                token.blacklist()

            # Clear cookies
            response = Response({"detail": "Successfully logged out"})
            response.delete_cookie("access_token")
            response.delete_cookie("refresh_token")

            return response
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LogoutAllView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            user = request.user
            tokens = OutstandingToken.objects.filter(user_id=user.id)

            # Blacklist all tokens for this user
            for token in tokens:
                BlacklistedToken.objects.get_or_create(token=token)

            # Clear cookies
            response = Response({"detail": "Successfully logged out from all devices"})
            response.delete_cookie("access_token")
            response.delete_cookie("refresh_token")

            return response
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GetCSRFTokenView(APIView):
    def get(self, request):
        csrf_token = get_token(request)
        return Response({"csrf_token": csrf_token})
