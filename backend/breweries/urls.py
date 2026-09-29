from django.urls import path

from .views import health_check, search_breweries

urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("breweries/", search_breweries, name="search-breweries"),
]
