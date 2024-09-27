from django.db import models

class Client(models.Model):
    name = models.CharField(max_length=100)
    client_code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name

class Contact(models.Model):
    name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    clients = models.ManyToManyField(Client, related_name='contacts')

    def __str__(self):
        return f"{self.name} {self.surname}"