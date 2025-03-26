from django.urls import path
from . import views  

urlpatterns = [
    # Authentication Endpoints
    path('signup/admin/', views.signup_admin),  
    path('login/', views.login),  
    path('logout/', views.logout), 

    path('users/get-details/',views.get_user_details), 

    # Employee API Endpoints
    path('employee/travel-requests/', views.travel_requests),  
    path('employee/travel-requests/<int:request_id>/', views.travel_request_detail),  
    path('employee/travel-requests/<int:request_id>/provide-info-manager/', views.provide_info_manager),
    path('employee/travel-requests/<int:request_id>/provide-info-admin/', views.provide_info_admin),    

    # Manager API Endpoints
    path('manager/travel-requests/', views.manager_travel_requests),  
    path('manager/travel-requests/<int:request_id>/', views.manager_travel_request_detail),
    path('manager/travel-requests/<int:request_id>/update-status/', views.update_travel_request_status),
    
    # Admin API Endpoints
    path('home/admin/', views.admin_homepage_listing),
    path('travel-admin/travel-requests/<int:request_id>/', views.admin_view_request_details),
    path('travel-admin/create-employee-manager/', views.create_employee_manager),
    path('travel-admin/requests/<int:request_id>/close/', views.admin_close_request),
    path('travel-admin/additional-request/<int:request_id>/', views.admin_additional_request),
     
    path('travel-admin/employees/', views.admin_employee_handler),
    path('travel-admin/employees/<int:employee_id>/', views.admin_employee_handler),

    path('travel-admin/managers/', views.admin_manager_handler),
    path('travel-admin/managers/<int:manager_id>/', views.admin_manager_handler), 


] 
