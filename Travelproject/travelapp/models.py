from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Disabled', 'Disabled')
    ]

    admin_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Active')

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    

class Manager(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Disabled', 'Disabled'),
        ('Terminated', 'Terminated')
    ]

    manager_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    hire_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Active')

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True )
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Disabled', 'Disabled'),
        ('Terminated', 'Terminated')
    ]
    employee_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    manager = models.ForeignKey(Manager, on_delete=models.SET_NULL, null=True)
    hire_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Active')

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class TravelRequests(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Cancelled', 'Cancelled'),
        ('More Info Required', 'More Info Required'),
        ('Resubmitted', 'Resubmitted') 
    ]
    ADMIN_STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Closed', 'Closed')
    ]

    request_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='travel_requests')
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE,  default=1)
    departure_location = models.CharField(max_length=50)
    destination = models.CharField(max_length=50)
    travel_mode = models.CharField(max_length=50)
    departure_date = models.DateField()
    return_date = models.DateField()
    lodging_required = models.BooleanField()
    preferred_lodge = models.CharField(max_length=200, null=True, blank=True)
    purpose = models.TextField()
    employee_additional_notes = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    manager_note = models.TextField(null=True, blank=True)
    admin_status = models.CharField(max_length=20, choices=ADMIN_STATUS_CHOICES, default='Open')
    admin_note = models.TextField(null=True, blank=True)
    employee_response_to_manager  = models.TextField(null=True, blank=True)
    employee_response_to_admin  = models.TextField(null=True, blank=True)    
    no_of_resubmission = models.PositiveIntegerField(default=0)
    submission_date = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)

class Resubmission(models.Model):
    ticket_request = models.ForeignKey(TravelRequests, on_delete=models.CASCADE, related_name='resubmissions')
    requested_date = models.DateField(auto_now_add=True)
    submitted_date = models.DateField(null=True, blank=True)




