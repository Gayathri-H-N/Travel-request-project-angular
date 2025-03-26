from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils.dateparse import parse_date
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import TravelRequests, Employee, Manager, Admin, Resubmission
from .Serializers import (
    TravelRequestSerializer,
    EmployeesSerializer,
    ManagerSerializer,
    AdminSerializer,
    EmployeeTravelRequestListSerializer,
    ManagerTravelRequestListSerializer,
    TravelRequestUpdateSerializer,
    AdminTravelRequestSerializer,
    AdminCloseRequestSerializer,
    AdminTravelRequestUpdateSerializer,
)
from .permissions import IsAdminUser, IsManagerUser, IsEmployeeUser
from django.core.mail import send_mail
from django.conf import settings
from datetime import date



# Create your views here.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def signup_admin(request):
    """
    Creates a new Admin user.
    Only accessible by admins.
    Expects role = "Admin" in the request.
    """
    role = request.data.get("role")
    if role != "Admin":
        return Response(
            {"error": "Invalid role. Must be 'Admin'."},
            status=status.HTTP_400_BAD_REQUEST
        )

    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username or not email or not password:
        return Response(
            {"error": "Username, email, and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if username or email already exists
    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists."},
            status=status.HTTP_400_BAD_REQUEST
        )
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email is already associated with an account."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create user with admin privileges
    user = User.objects.create_user(username=username, email=email, password=password)
    user.is_staff = True
    user.is_superuser = True
    user.save()

    admin_data = {
        "user": user.id,
        "first_name": request.data.get("first_name"),
        "last_name": request.data.get("last_name"),
        "email": email,
        "hire_date": request.data.get("hire_date"),
        "status": request.data.get("status"),
    }

    admin_serializer = AdminSerializer(data=admin_data)
    if admin_serializer.is_valid():
        admin_serializer.save()
        return Response(
            {"message": "Admin added successfully.", "data": admin_serializer.data},
            status=status.HTTP_201_CREATED
        )
    else:
        print("Admin serializer errors:", admin_serializer.errors)  # Debugging
        user.delete()
        return Response(admin_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

 
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """
    Authenticates a user and returns a token along with their role.
 
    Expects:
        - username (str): The username of the user.
        - password (str): The password of the user.
    """

    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({'error': 'Please provide both username and password'},
                        status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)

    if not user:
        return Response({'error': 'Invalid Credentials'},
                        status=status.HTTP_401_UNAUTHORIZED)
    
    # Determine user role
    role = "User"
    if user.is_superuser:
        role = "Admin"
    elif user.is_staff:
        role = "Manager"
    else:
        role = "Employee"

    Token.objects.filter(user=user).delete()
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({'token': token.key, 'role': role}, status=status.HTTP_200_OK)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logs out an authenticated user by deleting their authentication token.

    Expects:
        - The request must be sent by an authenticated user.
    """

    try:
        request.user.auth_token.delete()  
    except Exception as e:
        return Response({'error': 'An error occurred while logging out'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_details(request):
    """
    Fetch profile details of the logged-in user.

    - If the user is an Admin (is_superuser is True), return Admin table details.
    - If the user is a Manager (is_staff is True), return Manager details.
    - Otherwise, assume the user is an Employee and return Employee details.
    """
    user = request.user

    # Check if user is an Admin
    if user.is_superuser:
        try:
            admin = Admin.objects.get(user=user)
            data = {
                "role": "Admin",
                "admin_id": admin.admin_id,
                "admin_name": admin.full_name,
                "email": admin.email,
            }
            return Response(data, status=status.HTTP_200_OK)
        except Admin.DoesNotExist:
            return Response({"error": "Admin record not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is a Manager
    elif user.is_staff:
        try:
            manager = Manager.objects.get(user=user)
            data = {
                "role": "Manager",
                "manager_id": manager.manager_id,
                "manager_name": manager.full_name,
                "email": manager.email,
            }
            return Response(data, status=status.HTTP_200_OK)
        except Manager.DoesNotExist:
            return Response({"error": "Manager record not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Otherwise, treat user as Employee
    else:
        try:
            employee = Employee.objects.get(user=user)
            data = {
                "role": "Employee",
                "employee_id": employee.employee_id,
                "employee_name": employee.full_name,
                "manager_name": employee.manager.full_name if employee.manager else "N/A",
                "email": user.email,
            }
            return Response(data, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response({"error": "Employee record not found"}, status=status.HTTP_404_NOT_FOUND)
        

@api_view(['GET', 'POST'])
@permission_classes([ IsEmployeeUser])
def travel_requests(request):
    """
    Handles travel requests for an authenticated employee.

    Methods:
        - GET: Retrieves a list of all travel requests for the logged-in employee.
        - POST: Creates a new travel request for the employee.
    """
 
    employee = Employee.objects.filter(user=request.user).first()
    if not employee:
        return Response({"error": "Employee record not found."}, status=status.HTTP_404_NOT_FOUND)
   
    if request.method == 'GET': 
        travel_requests = TravelRequests.objects.filter(employee=employee)
        serializer = EmployeeTravelRequestListSerializer(travel_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    if request.method == 'POST':
        serializer = TravelRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(employee=employee)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsEmployeeUser])
def travel_request_detail(request, request_id):
    """
    Handles operations on a specific travel request for an authenticated employee.

    Methods:
        - GET: Retrieves the details of a specific travel request.
        - PUT: Updates a travel request if its status is 'Pending'.
        - DELETE: Cancels a travel request if its status is 'Pending'.

    Parameters:
        - request_id (int): The ID of the travel request to be retrieved, updated, or deleted.
    """

    employee = Employee.objects.filter(user=request.user).first()
    if not employee:
        return Response({"error": "Employee record not found."}, status=status.HTTP_404_NOT_FOUND)
    
    travel_request = TravelRequests.objects.filter(request_id=request_id, employee=employee).first()
    
    if not travel_request:
        return Response({'error': 'Travel request not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = TravelRequestSerializer(travel_request)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    if request.method == 'PUT':
        if travel_request.status != 'Pending':
            return Response({'error': 'Only pending requests can be updated'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = TravelRequestSerializer(travel_request, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        if travel_request.status != 'Pending':
            return Response({'error': 'Only pending requests can be deleted'}, status=status.HTTP_400_BAD_REQUEST)
        travel_request.delete()
        return Response({'message': 'Travel request canceled successfully'}, status=status.HTTP_204_NO_CONTENT)
    

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsEmployeeUser])
def provide_info_manager(request, request_id):
    """
    Allows an employee to provide additional information for a travel request.
    Sends an email notification to the manager informing them of the update.

    Methods:
        - PUT: Updates the travel request with additional details and changes its status to 'Resubmitted
    """

    travel_request = TravelRequests.objects.filter(request_id=request_id, employee__user=request.user, status='More Info Required').first()
        
    if not travel_request:
        return Response({'error': 'Travel request not found'}, status=status.HTTP_404_NOT_FOUND)
        
    serializer = TravelRequestSerializer(travel_request, data=request.data, partial=True)
    if serializer.is_valid():
        travel_request.no_of_resubmission += 1
        updated_request = serializer.save(status='Resubmitted')
        Resubmission.objects.create(
            ticket_request=updated_request,
            submitted_date=date.today()
            )
            
        send_mail(
            subject="Employee has provided additional information",
            message=f"Dear {travel_request.employee.manager.user.username},\n\n"
                    f"The employee {travel_request.employee.user.username} has provided additional details for their travel request.\n"
                    "Please review the updated request.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[travel_request.employee.manager.user.email],
            fail_silently=False,
            )

        return Response({'message': 'Additional info provided successfully'}, status=status.HTTP_200_OK)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsEmployeeUser])
def provide_info_admin(request, request_id):
    """
    Allows an employee to provide additional information for a travel request.
    Sends an email notification to the admin informing them of the update.

    Methods:
        - PUT: Updates the travel request with additional details and changes its status to 'Resubmitted'.
    """

    travel_request = TravelRequests.objects.filter(
        request_id=request_id, 
        employee__user=request.user, 
        status='More Info Required'
    ).first()

    if not travel_request:
        return Response({'error': 'Travel request not found or not awaiting additional info'}, status=status.HTTP_404_NOT_FOUND)

    # Ensure the admin has actually provided a note before allowing the employee to respond
    if not travel_request.admin_note:
        return Response({'error': 'Admin note is required before providing a response'}, status=status.HTTP_400_BAD_REQUEST)

    # Ensure employee_response_to_admin is provided in request data
    request_data = request.data
    if 'employee_response_to_admin' not in request_data or not request_data['employee_response_to_admin'].strip():
        return Response({'error': 'employee_response_to_admin is required'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = TravelRequestSerializer(travel_request, data=request_data, partial=True)
    
    if serializer.is_valid():
        travel_request.no_of_resubmission += 1
        travel_request.employee_response_to_admin = request_data['employee_response_to_admin']  # Update response field
        updated_request = serializer.save(status='Resubmitted')

        # Log the resubmission
        Resubmission.objects.create(
            ticket_request=updated_request,
            submitted_date=date.today()
        )

        # Notify the admin
        send_mail(
            subject="Employee has provided additional information for your request",
            message=f"Dear {travel_request.admin.user.username},\n\n"
                    f"The employee {travel_request.employee.full_name} has provided additional details for travel request {travel_request.request_id}.\n"
                    "Please review the updated request.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[travel_request.admin.user.email],
            fail_silently=False,
        )

        return Response({'message': 'Additional info for admin provided successfully'}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsManagerUser])
def manager_travel_requests(request):
    """
    Retrieves a list of travel requests assigned to the manager.

    Methods:
        - GET: Fetches travel requests for employees under the logged-in manager.

    Query Parameters (Optional Filters):
        - status (str): Filters travel requests by status.
        - name (str): Filters travel requests by employee username (case-insensitive).
        - start_date (str, YYYY-MM-DD): Start date for filtering requests by submission date.
        - end_date (str, YYYY-MM-DD): End date for filtering requests by submission date.
        - sort_by (str, default: "submission_date"): Specifies the field to sort by.
        - order (str, "asc" or "desc", default: "desc"): Sorting order (ascending/descending).
    """
    
    travel_requests = TravelRequests.objects.filter(employee__manager__user=request.user)

    status_filter = request.query_params.get("status")
    if status_filter:
        travel_requests = travel_requests.filter(status=status_filter)

    name = request.query_params.get("name")
    if name:
        travel_requests = travel_requests.filter(employee__user__username__icontains=name)

    start_date = request.query_params.get("departure_date")
    end_date = request.query_params.get("return_date")
    if start_date and end_date:
         start = parse_date(start_date)
         end = parse_date(end_date)
         travel_requests = travel_requests.filter(
         departure_date__gte=start,
         return_date__lte=end
    )

    sort_by = request.query_params.get("sort_by", "submission_date")
    # order = request.query_params.get("order", "desc")
    if sort_by == "submission_date":
        # Default to descending order if sorting by submission_date.
        order = request.query_params.get("order", "desc")
    else:
        # Default to ascending order for other fields (e.g., employee_name).
        order = request.query_params.get("order", "asc")
    if order == "asc":
        travel_requests = travel_requests.order_by(sort_by)
    else:
        travel_requests = travel_requests.order_by(f"-{sort_by}")

    serializer = ManagerTravelRequestListSerializer(travel_requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsManagerUser])
def manager_travel_request_detail(request, request_id):
    """
    Retrieves details of a specific travel request for a manager.

    Methods:
        - GET: Fetches detailed information about a travel request made by an employee under the logged-in manager.

    Parameters:
        - request_id (int): The ID of the travel request.
    """

    travel_request = TravelRequests.objects.filter(request_id=request_id, employee__manager__user=request.user).first()
    if not travel_request:
        return Response({'error': 'Travel request not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

    serializer = TravelRequestSerializer(travel_request)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsManagerUser])
def update_travel_request_status(request, request_id):
    """
    Allows a manager to update the status of an employee's travel request, add a note.
    If "More Info Required" is selected, an email notification is sent to the employee requesting additional details.

    Methods:
        - PATCH: Updates the status of a travel request, adds a note, and optionally updates the number of resubmissions.

    Parameters:
        - request_id (int): The ID of the travel request.
        - status (str, required): The new status of the travel request. Allowed values: "Approved", "Rejected", "More Info Required".
        - manager_note (str, optional): A note from the manager explaining the decision.
    """

    travel_request = TravelRequests.objects.filter(request_id=request_id, employee__manager__user=request.user).first()
    if not travel_request:
        return Response({'error': 'Travel request not found or access denied'}, status=status.HTTP_404_NOT_FOUND)
    
    new_status = request.data.get("status")
    if not new_status:
        return Response({'error': 'Status field is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    valid_statuses = ["Approved", "Rejected", "More Info Required", "Resubmitted"]
    if new_status not in valid_statuses:
        return Response({'error': 'Invalid status update'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = TravelRequestUpdateSerializer(travel_request, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        if new_status == "More Info Required":
            send_mail(
                subject="Additional Information Required for Travel Request",
                message=f"Dear {travel_request.employee.user.username},\n\nYour manager has requested more information regarding your travel request.\nManager's Note: {request.data.get('manager_note', 'No additional note.')}\n\nPlease update the request at your earliest convenience.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[travel_request.employee.user.email],
                fail_silently=False,
            )
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated,IsAdminUser])
def admin_homepage_listing(request):
    """
    Retrieves and lists all travel requests with filtering and sorting options for the admin home page.

    Methods:
        - GET: Fetches all travel requests with optional filters and sorting.
    
    Query Parameters:
        - status (str, optional): Filters requests by status (case-insensitive).
        - name (str, optional): Searches travel requests by employee name.
        - sort_by (str, optional, default="departure_date"): Specifies sorting field. Allowed values: 
          ["departure_date", "request_id", "status", "employee__employee_id"].
        - order (str, optional, default="asc"): Specifies sorting order. Allowed values: "asc" or "desc".
    """

    travel_requests = TravelRequests.objects.all()

    status_filter = request.query_params.get("status")
    if status_filter:
        travel_requests = travel_requests.filter(status__iexact=status_filter)

    search_query = request.query_params.get("name")
    if search_query:
        travel_requests = travel_requests.filter(employee__name__icontains=search_query)
    
    start_date = request.query_params.get("departure_date")
    end_date = request.query_params.get("return_date")

    if start_date:
        start = parse_date(start_date)
        if start:
            travel_requests = travel_requests.filter(departure_date__gte=start)

    if end_date:
        end = parse_date(end_date)
        if end:
            travel_requests = travel_requests.filter(return_date__lte=end)


    # Determine sorting parameters
    sort_by = request.query_params.get("sort_by", "submission_date")
    if sort_by == "submission_date":
        order = request.query_params.get("order", "desc")
    else:
        order = request.query_params.get("order", "asc")

    if order == "asc":
        travel_requests = travel_requests.order_by(sort_by)
    else:
        travel_requests = travel_requests.order_by(f"-{sort_by}")

    serializer = AdminTravelRequestSerializer(travel_requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
    
   
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_view_request_details(request, request_id):
    """
    Retrieves the details of a specific travel request for admin viewing.

    Methods:
        - GET: Returns a single travel request's details.
    """
    try:
        travel_request = TravelRequests.objects.get(request_id=request_id)
    except TravelRequests.DoesNotExist:
        return Response(
            {"error": "Travel request not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = TravelRequestSerializer(travel_request)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_employee_manager(request):
    """
    Creates a new Employee or Manager user.
    Expects role = "Employee" or "Manager" in the request.

    Methods:
        - POST: Allows admins to create a new Employee or Manager account.
    """

    role = request.data.get("role")
    if role not in ["Employee", "Manager"]:
        return Response(
            {"error": "Invalid role for this endpoint. Must be 'Employee' or 'Manager'."},
            status=status.HTTP_400_BAD_REQUEST
        )

    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username or not email or not password:
        return Response(
            {"error": "Username, email, and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists."},
            status=status.HTTP_400_BAD_REQUEST
        )
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email is already associated with an account."},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(username=username, email=email, password=password)
    
    if role == "Employee":
        user.is_staff = False
        user.is_superuser = False
        user.save()

        employee_data = {
            "user": user.id,
            "first_name": request.data.get("first_name"),
            "last_name": request.data.get("last_name"),
            "email": email,
            "manager": request.data.get("manager"),
            "hire_date": request.data.get("hire_date"),
            "status": request.data.get("status"),
        }

        employee_serializer = EmployeesSerializer(data=employee_data)
        if employee_serializer.is_valid():
            employee_serializer.save()
            return Response(
                {"message": "Employee added successfully.", "data": employee_serializer.data},
                status=status.HTTP_201_CREATED
            )
        else:
            user.delete()
            return Response(employee_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif role == "Manager":
        user.is_staff = True
        user.is_superuser = False
        user.save()

        manager_data = {
            "user": user.id,
            "first_name": request.data.get("first_name"),
            "last_name": request.data.get("last_name"),
            "email": email,
            "hire_date": request.data.get("hire_date"),
            "status": request.data.get("status"),
        }

        manager_serializer = ManagerSerializer(data=manager_data)
        if manager_serializer.is_valid():
            manager_serializer.save()
            return Response(
                {"message": "Manager added successfully.", "data": manager_serializer.data},
                status=status.HTTP_201_CREATED
            )
        else:
            user.delete()
            return Response(manager_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_employee_handler(request, employee_id=None):
    """
    Handles listing, retrieving, and updating employees.

    Methods:
        - GET (without employee_id): Lists all employees.
        - GET (with employee_id): Retrieves details of a specific employee.
        - PUT (with employee_id): Updates details of a specific employee.

    Parameters:
        - employee_id (int, optional): The ID of the employee to retrieve or update.
    """

    if employee_id:  # If an employee_id is provided, retrieve that employee
        employee = Employee.objects.filter(employee_id=employee_id).first()
        if not employee:
            return Response({"error": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.method == "GET":
            serializer = EmployeesSerializer(employee)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "PUT":
            serializer = EmployeesSerializer(employee, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {"message": "Employee details updated successfully.", "data": serializer.data},
                    status=status.HTTP_200_OK
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    else:  # If no employee_id is given, list all employees
        employees = Employee.objects.all()
        serializer = EmployeesSerializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_manager_handler(request, manager_id=None):
    """
    Handles listing, retrieving, and updating managers.

    Methods:
        - GET (without manager_id): Lists all managers.
        - GET (with manager_id): Retrieves details of a specific manager.
        - PUT (with manager_id): Updates details of a specific manager.

    Parameters:
        - manager_id (int, optional): The ID of the manager to retrieve or update.
    """

    if manager_id: 
        manager = Manager.objects.filter(manager_id=manager_id).first()
        if not manager:
            return Response({"error": "Manager not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.method == "GET":
            serializer = ManagerSerializer(manager)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "PUT":
            serializer = ManagerSerializer(manager, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {"message": "Manager details updated successfully.", "data": serializer.data},
                    status=status.HTTP_200_OK
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    else:  
        managers = Manager.objects.all()
        serializer = ManagerSerializer(managers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def admin_close_request(request, request_id):
    """
    Closes an approved travel request.
    This endpoint allows an admin to process and close a travel request.
    Only travel requests with the status "Approved" can be closed.

    Methods:
        - PATCH: Closes an approved travel request by updating its status to 'Closed'.

    Parameters:
        - request_id (int): The ID of the travel request to be closed.
    """
    try:
        travel_request = TravelRequests.objects.get(request_id=request_id)
    except TravelRequests.DoesNotExist:
        return Response({"error": "Travel request not found."}, status=status.HTTP_404_NOT_FOUND)

    if travel_request.status.lower() != "approved":
        return Response({"error": "Only approved requests can be closed."}, status=status.HTTP_400_BAD_REQUEST)

    request.data["admin_status"] = "Closed"

    serializer = AdminCloseRequestSerializer(travel_request, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Travel request closed successfully.", "data": serializer.data},
            status=status.HTTP_200_OK,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def admin_additional_request(request, request_id):
    """
    Updates a travel request with admin notes and admin status.
    If "admin_notes" is provided, an email is sent to the employee requesting additional information.

    Methods:
        - PATCH: Updates the admin notes and admin status for a travel request.

    Parameters:
        - request_id (int): The ID of the travel request to be updated.
    """
    try:
        travel_request = TravelRequests.objects.get(request_id=request_id)
    except TravelRequests.DoesNotExist:
        return Response({"error": "Travel request not found."}, status=status.HTTP_404_NOT_FOUND)

    allowed_fields = {"admin_note", "admin_status"}
    request_data = {key: value for key, value in request.data.items() if key in allowed_fields}

    if not request_data:
        return Response({"error": "No valid fields provided for update."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = AdminTravelRequestUpdateSerializer(travel_request, data=request_data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        if request_data.get("admin_note"):
            send_mail(
             subject="Additional Information Requested for Your Travel Request",
             message=f"Dear {travel_request.employee.user.username},\n\nAn admin has requested additional information regarding your travel request.\n\nAdmin's Note: {request_data.get('admin_note')}\n\nPlease update your request at your earliest convenience.",
             from_email=settings.DEFAULT_FROM_EMAIL,
             recipient_list=[travel_request.employee.user.email],
             fail_silently=False,
         )

        

        return Response(
            {"message": "Travel request updated successfully.", "data": serializer.data},
            status=status.HTTP_200_OK,
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




