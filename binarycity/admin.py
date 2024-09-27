from django.contrib import admin
from .models import Client, Contact

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'client_code')
    search_fields = ('name', 'client_code')

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'surname', 'email')
    search_fields = ('name', 'surname', 'email')
    filter_horizontal = ('clients',)