from django.contrib import admin
from django.urls import path
from .viewslogin import login_view
from . import viewshome

urlpatterns = [
    
    path('', login_view, name='login'),
    path('home/', viewshome.home, name='home'),
    path('create_client/', viewshome.create_client, name='create_client'),
    path('create_contact/', viewshome.create_contact, name='create_contact'),
    path('get_clients/', viewshome.get_clients, name='get_clients'),
    path('get_contacts/', viewshome.get_contacts, name='get_contacts'),
    path('update_client/<int:id>/', viewshome.update_client, name='update_client'),
    path('update_contact/<int:id>/', viewshome.update_contact, name='update_contact'),
    path('delete_client/<int:id>/', viewshome.delete_client, name='delete_client'),
    path('delete_contact/<int:id>/', viewshome.delete_contact, name='delete_contact'),
    path('get_contact/<int:id>/', viewshome.get_contact, name='get_contact'),
        path('get_linked_contacts/<int:client_id>/', viewshome.get_linked_contacts, name='get_linked_contacts'),
    path('get_linked_clients/<int:contact_id>/', viewshome.get_linked_clients, name='get_linked_clients'),
]