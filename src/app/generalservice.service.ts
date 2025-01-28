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
  CreateInvoice(obj){
    return this.http.post('localhost:3000/api/invoice/createNewInvoice',obj);
  }
  UpdateInvoice(obj,invoiceRefNo){
    return this.http.post('http://localhost:3000/api/updateInvoiceByReferenceNo/invoiceRefNo',obj);
  }
  getstateList(){
    return this.http.get('localhost:3000/api/invoice/stateList');
  }
}
