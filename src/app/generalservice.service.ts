import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class GeneralserviceService {
  setLoginDataList: any;
  
  constructor(private http: HttpClient) { }


  getAllInvoice(){
    return this.http.get('http://localhost:3000/api/invoice/getAllInvoices');
  }
}
