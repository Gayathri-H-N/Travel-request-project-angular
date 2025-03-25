import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeTravelService {
  private employeeData: any = null;
   

  constructor(private http: HttpClient) {}
  private getAuthHeaders() {
    const token = localStorage.getItem('token'); 
    return {
      headers: new HttpHeaders({
      Authorization: `Token ${token}` 
      })
    };
  }


  getEmployeeDetails(): Observable<any> {
    return this.http.get('http://127.0.0.1:8000/employee/get-details/', this.getAuthHeaders());
  }
  
  getData(): Observable<any> {
    return this.http.get('http://127.0.0.1:8000/employee/travel-requests/', this.getAuthHeaders());
  }

  createRequest(requestData: any): Observable<any> {
    return this.http.post('http://127.0.0.1:8000/employee/travel-requests/', requestData, this.getAuthHeaders());
  }

  deleteTravelRequest(requestId: number): Observable<any> {
    const url = `http://127.0.0.1:8000/employee/travel-requests/${requestId}/`;
    return this.http.delete(url, this.getAuthHeaders());
  }

  getTravelRequestById(requestId: number): Observable<any> {
    const url = `http://127.0.0.1:8000/employee/travel-requests/${requestId}/`;
    return this.http.get(url, this.getAuthHeaders());
  }
  
provideInfoToManager(requestId: number, requestData: any): Observable<any> {
  const url = `http://127.0.0.1:8000/employee/travel-requests/${requestId}/provide-info-manager/`;
  return this.http.put(url, requestData, this.getAuthHeaders());
}

provideAdminInfo(requestId: number, data: any): Observable<any> {
  const url = `http://127.0.0.1:8000/employee/travel-requests/${requestId}/provide-info-admin/`;
  return this.http.put(url, data, this.getAuthHeaders());
}

}
 

