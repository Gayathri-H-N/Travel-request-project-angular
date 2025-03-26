import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminTravelService {

  constructor(private http: HttpClient) { }
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found in localStorage');
        return {};  // Return empty headers
    }
    // console.log('Retrieved token:', token);
    return {
        headers: new HttpHeaders({
            Authorization: `Token ${token}`
        })
    };
}   

  // GET admin travel requests with filters
  getTravelRequests(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    console.log("from getTravelRequests",localStorage.getItem('token'))
    // The Django backend expects parameters: status, name, start_date, end_date, sort_by, order.
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });
    // console.log(params)
    return this.http.get('http://127.0.0.1:8000/home/admin/', { params, headers: this.getAuthHeaders().headers });

  }


  // Get a single travel request by ID
  getTravelRequestById(requestId: number): Observable<any> {
    const url = `http://127.0.0.1:8000/travel-admin/travel-requests/${requestId}/`;
    return this.http.get(url, this.getAuthHeaders());
  }

  // Request additional info by updating the travel request with admin note,
  // setting status to 'More Info Required'
  requestMoreInfo(requestId: number, payload: any): Observable<any> {
    const url = `http://127.0.0.1:8000/travel-admin/additional-request/${requestId}/`;
    return this.http.patch(url, payload, this.getAuthHeaders());
  }

  // Close a travel request (PATCH update)
  closeRequest(requestId: number): Observable<any> {
    const url = `http://127.0.0.1:8000/travel-admin/requests/${requestId}/close/`;
    return this.http.patch(url, { status: 'Closed' }, this.getAuthHeaders());
  }

  createEmployeeManager(payload: any): Observable<any> {
    const url = 'http://127.0.0.1:8000/travel-admin/create-employee-manager/';
    return this.http.post(url, payload, this.getAuthHeaders());
  }
  
}

