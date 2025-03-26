from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admins (superusers).
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser


class IsManagerUser(permissions.BasePermission):
    """
    Custom permission to only allow managers (staff users).
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff and not request.user.is_superuser


class IsEmployeeUser(permissions.BasePermission):
    """
    Custom permission to only allow employees (non-staff, non-superusers).
    Employees can only view, edit, or cancel their own travel requests.
    """

    def has_permission(self, request, view):
        # Check if the user is authenticated and is neither staff nor a superuser
        return request.user and request.user.is_authenticated and not request.user.is_staff and not request.user.is_superuser

    def has_object_permission(self, request, view, obj):
        """
        Object-level permission to allow employees to access only their own requests.
        Assumes that the TravelRequest model has a `user` field linking to the owner.
        """
        return obj.user == request.user  # Ensures employees can only manage their own requests
