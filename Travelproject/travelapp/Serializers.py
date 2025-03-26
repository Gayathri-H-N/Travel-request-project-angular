from rest_framework import serializers
from .models import TravelRequests, Manager,Employee,Admin
from django.contrib.auth.models import User


class ManagerSerializer(serializers.ModelSerializer):
    """
    Serializer for manager details.
    """
    class Meta:
        model = Manager
        fields = '__all__'  


class EmployeesSerializer(serializers.ModelSerializer):
    """
    Serializer for employee details.
    
    Includes the linked user account.
    """
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True)  # Include user
    manager = serializers.PrimaryKeyRelatedField(queryset=Manager.objects.all(), required=False)
    class Meta:
        model = Employee
        fields = '__all__'


class AdminSerializer(serializers.ModelSerializer):
    """
    Serializer for admin details.
    """
    class Meta:
        model = Admin
        fields = '__all__' 


class TravelRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for travel requests.
    Includes employee details such as name and manager information.
    """
    employee = serializers.PrimaryKeyRelatedField(read_only=True)
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    manager_id = serializers.IntegerField(source="employee.manager.manager_id", read_only=True)
    manager_name = serializers.CharField(source="employee.manager.full_name", read_only=True)
    class Meta:
        model = TravelRequests
        fields = '__all__'

class EmployeeTravelRequestListSerializer(serializers.ModelSerializer):
    employee = EmployeesSerializer(read_only=True)
    """
    Serializer for employees to list their travel requests with limited details.
    """
    class Meta:
        model = TravelRequests
        fields = ['request_id', 'submission_date', 'departure_location', 'destination', 'departure_date', 'return_date', 'status','admin_status','employee']


class ManagerTravelRequestListSerializer(serializers.ModelSerializer):
    """
    Serializer for managers to list travel requests assigned to them.
    """
    employee_id = serializers.IntegerField(source="employee.employee_id", read_only=True)
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)

    class Meta:
        model = TravelRequests
        fields = ['employee_id', 'request_id','employee_name','submission_date', 'departure_location', 'destination', 
                  'departure_date', 'return_date', 'status','admin_status']

class TravelRequestUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating travel request details.
    
    Allows updating status, manager notes, and number of resubmissions.
    """
    class Meta:
        model = TravelRequests
        fields = ['status', 'manager_note', 'no_of_resubmission']



class AdminTravelRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for the admin to view all travel requests.
    
    Includes employee and manager details.
    """
    employee_id = serializers.IntegerField(source="employee.employee_id", read_only=True)
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    manager_name = serializers.CharField(source="employee.manager.full_name", read_only=True)
    class Meta:
        model = TravelRequests
        fields = ['employee_id','request_id','employee_name','manager_name','submission_date', 'departure_location', 'destination', 
                  'departure_date', 'return_date', 'status', 'admin_status',  
                  'manager_note', 'no_of_resubmission']



# class AdminEmployeeListSerializer(serializers.ModelSerializer):

class AdminCloseRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for the admin to view all travel requests.
    
    Includes employee and manager details.
    """
    class Meta:
        model = TravelRequests
        fields = ['admin_status']
    
    def validate_status(self, value):
        if value.lower() != "closed":
            raise serializers.ValidationError("Admin can only close approved requests.")
        return value
    
    
class AdminTravelRequestUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer to allow an admin to update a travel request.
    Admin can modify the admin status and add an admin note.
    """
    class Meta:
        model = TravelRequests
        fields = ['admin_status', 'admin_note']

    def validate_admin_status(self, value):
        if value.lower() not in ["open", "closed"]:
            raise serializers.ValidationError("Admin status must be either 'Open' or 'Closed'.")
        return value


