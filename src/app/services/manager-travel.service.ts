import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManagerTravelService {

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('token'); 
    return {
      headers: new HttpHeaders({
        Authorization: `Token ${token}`
      })
    };
  }
  

  // GET manager travel requests with filters
  getTravelRequests(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    // The Django backend expects parameters: status, name, start_date, end_date, sort_by, order.
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });
    console.log(params)
    return this.http.get('http://127.0.0.1:8000/manager/travel-requests/', {
      params,
      headers: this.getAuthHeaders().headers
    });
  }

   // GET single travel request details
   getTravelRequestDetail(requestId: number): Observable<any> {
    const url = `http://127.0.0.1:8000/manager/travel-requests/${requestId}/`;
    return this.http.get(url, this.getAuthHeaders());
  }

  // PATCH update travel request status (Approve/Reject/More Info Required)
  updateTravelRequestStatus(requestId: number, data: any): Observable<any> {
    return this.http.patch(`http://127.0.0.1:8000/manager/travel-requests/${requestId}/update-status/`, data, this.getAuthHeaders());
  }
}
