from django.urls import path
from .views import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    CookieTokenVerifyView,
    LogoutView,
    LogoutAllView,
    GetCSRFTokenView,
)

urlpatterns = [
    path("login/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("verify/", CookieTokenVerifyView.as_view(), name="token_verify"),
    path("logout/", LogoutView.as_view(), name="auth_logout"),
    path("logout-all/", LogoutAllView.as_view(), name="auth_logout_all"),
    path("csrf/", GetCSRFTokenView.as_view(), name="get_csrf_token"),
]
