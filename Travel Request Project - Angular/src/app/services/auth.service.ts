import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

    // Django login endpoint URL
    private apiUrl = 'http://127.0.0.1:8000/login/';

    private userDetailsUrl = 'http://127.0.0.1:8000/users/get-details/';
  
    constructor(private http: HttpClient) {}
  
    /**
     * Login method that posts the user credentials to the Django endpoint.
     * Returns an Observable with the token and role.
     */
    login(credentials: { username: string, password: string }): Observable<any> {
      return this.http.post(this.apiUrl, credentials);
    }

    getUserDetails(): Observable<any> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
      return this.http.get(this.userDetailsUrl, { headers });
    }


    logout(): Observable<any> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
      
      return this.http.post('http://127.0.0.1:8000/logout/', {}, { headers });
    }
    
  }


