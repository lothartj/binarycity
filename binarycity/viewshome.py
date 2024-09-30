from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import Client, Contact
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.db.models import Count
import json

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            return render(request, 'login.html', {'error': 'Invalid credentials'})
    return render(request, 'login.html')

@login_required(login_url='login')
def home(request):
    clients = Client.objects.all()
    contacts = Contact.objects.all()
    context = {
        'clients': clients,
        'contacts': contacts,
    }
    return render(request, 'home.html', context)

@login_required(login_url='login')
@require_http_methods(["POST"])
@csrf_exempt
def create_client(request):
    data = json.loads(request.body)
    name = data.get('name')
    client_code = data.get('client_code')
    
    if not name or not client_code:
        return JsonResponse({'error': 'Name and Client Code are required'}, status=400)
    
    client = Client.objects.create(name=name, client_code=client_code)
    return JsonResponse({
        'id': client.id,
        'name': client.name,
        'client_code': client.client_code,
        'linked_contacts': client.contacts.count()
    })

@login_required(login_url='login')
@require_http_methods(["POST"])
@csrf_exempt
def create_contact(request):
    data = json.loads(request.body)
    name = data.get('name')
    surname = data.get('surname')
    email = data.get('email')
    client_id = data.get('client_id')
    
    if not name or not surname or not email:
        return JsonResponse({'error': 'Name, Surname, and Email are required'}, status=400)
    
    contact = Contact.objects.create(name=name, surname=surname, email=email)
    if client_id:
        client = get_object_or_404(Client, id=client_id)
        contact.clients.add(client)
    
    return JsonResponse({
        'id': contact.id,
        'name': contact.name,
        'surname': contact.surname,
        'email': contact.email,
        'linked_clients': contact.clients.count()
    })

@login_required(login_url='login')
@require_http_methods(["GET"])
def get_clients(request):
    sort = request.GET.get('sort', 'name')
    direction = request.GET.get('direction', 'asc')
    
    clients = Client.objects.annotate(linked_contacts=Count('contacts'))
    
    if direction == 'desc':
        sort = f'-{sort}'
    
    clients = clients.order_by(sort)
    
    return JsonResponse([{
        'id': client.id,
        'name': client.name,
        'client_code': client.client_code,
        'linked_contacts': client.linked_contacts
    } for client in clients], safe=False)

@login_required(login_url='login')
@require_http_methods(["GET"])
def get_contacts(request):
    sort = request.GET.get('sort', 'name')
    direction = request.GET.get('direction', 'asc')
    
    contacts = Contact.objects.annotate(linked_clients=Count('clients'))
    
    if direction == 'desc':
        sort = f'-{sort}'
    
    contacts = contacts.order_by(sort)
    
    return JsonResponse([{
        'id': contact.id,
        'name': contact.name,
        'surname': contact.surname,
        'email': contact.email,
        'linked_clients': contact.linked_clients
    } for contact in contacts], safe=False)

@login_required(login_url='login')
@require_http_methods(["GET"])
def get_contact(request, id):
    contact = get_object_or_404(Contact, id=id)
    return JsonResponse({
        'id': contact.id,
        'name': contact.name,
        'surname': contact.surname,
        'email': contact.email,
        'client_id': contact.clients.first().id if contact.clients.exists() else None,
        'linked_clients': contact.clients.count()
    })

@login_required(login_url='login')
@require_http_methods(["POST"])
@csrf_exempt
def update_client(request, id):
    client = get_object_or_404(Client, id=id)
    data = json.loads(request.body)
    client.name = data.get('name', client.name)
    client.save()
    return JsonResponse({
        'id': client.id,
        'name': client.name,
        'client_code': client.client_code,
        'linked_contacts': client.contacts.count()
    })

@login_required(login_url='login')
@require_http_methods(["POST"])
@csrf_exempt
def update_contact(request, id):
    contact = get_object_or_404(Contact, id=id)
    data = json.loads(request.body)
    contact.name = data.get('name', contact.name)
    contact.surname = data.get('surname', contact.surname)
    contact.email = data.get('email', contact.email)
    client_id = data.get('client_id')
    
    contact.save()
    
    contact.clients.clear()
    if client_id:
        client = get_object_or_404(Client, id=client_id)
        contact.clients.add(client)
    
    return JsonResponse({
        'id': contact.id,
        'name': contact.name,
        'surname': contact.surname,
        'email': contact.email,
        'linked_clients': contact.clients.count()
    })

@login_required(login_url='login')
@require_http_methods(["POST"])
@csrf_exempt
def delete_client(request, id):
    client = get_object_or_404(Client, id=id)
    client.delete()
    return JsonResponse({'success': True})

@login_required(login_url='login')
@require_http_methods(["POST"])
@csrf_exempt
def delete_contact(request, id):
    contact = get_object_or_404(Contact, id=id)
    contact.delete()
    return JsonResponse({'success': True})

@login_required(login_url='login')
@require_http_methods(["GET"])
def get_linked_contacts(request, client_id):
    client = get_object_or_404(Client, id=client_id)
    contacts = client.contacts.all()
    return JsonResponse({
        'contacts': [
            {
                'name': contact.name,
                'surname': contact.surname,
                'email': contact.email
            } for contact in contacts
        ]
    })

@login_required(login_url='login')
@require_http_methods(["GET"])
def get_linked_clients(request, contact_id):
    contact = get_object_or_404(Contact, id=contact_id)
    clients = contact.clients.all()
    return JsonResponse({
        'clients': [
            {
                'name': client.name,
                'client_code': client.client_code
            } for client in clients
        ]
    })