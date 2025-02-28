import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class GeneralserviceService {
 
  resetPasswordData(): any {
    throw new Error('Method not implemented.');
  }
 
  setLoginDataList: any;
  userList: any;
  loginResponse: any;
  setTableData: any;
  

  
  constructor(private http: HttpClient) { }

  setLoginResponse(data){
    this.loginResponse = data;
}
getLoginResponse(){
   return this.loginResponse;
}
  getAllInvoice(obj){
    return this.http.post(environment.baseUrl+'invoice/getAllInvoices',obj);
  }
  CreateInvoice(obj){
    return this.http.post(environment.baseUrl+'invoice/createNewInvoice',obj);
  }
  
  UpdateInvoice(obj,invoiceRefNo){
    return this.http.put(environment.baseUrl+'updateInvoiceByReferenceNo/'+invoiceRefNo,obj);
  }
  getstateList(){
    return this.http.get(environment.baseUrl+'invoice/stateList');
  }

  invoiceTemplate(obj){
    return this.http.post(environment.baseUrl+'invoice/invoiceTemplate',obj);

  }
  userNewCreation(obj){
    return this.http.post(environment.baseUrl+'invoice/userNewCreation',obj);

  }
  getAllUserList(){
    return this.http.get(environment.baseUrl+'invoice/getAllUserList');
  }

  submitLogin(obj){
    return this.http.post(environment.baseUrl+'invoice/authenticationLogin',obj);
  }
  updateExitUser(obj,userUniqueId){
    return this.http.put(environment.baseUrl+'invoice/updateExitUser/'+userUniqueId,obj);
  }
  invoiceApprovedOrRejected(obj){
    return this.http.post(environment.baseUrl+'invoice/invoiceApprovedOrRejected',obj);
  }
  forgotPassword(obj){
    return this.http.post(environment.baseUrl+'invoice/forgotPassword',obj);
  }
  getAllCustomerList(){
    return this.http.get(environment.baseUrl+'invoice/getAllCustomerList');
  }
  savecustomerCreation(obj){
    return this.http.post(environment.baseUrl+'invoice/SaveCustomerCreation',obj);
 
  }
  updateExitCustomer(obj,customerUniqueId){
    return this.http.put(environment.baseUrl+'invoice/updateExitCustomer/'+customerUniqueId,obj);
 
  }
  reviewedUpadte(obj){
    return this.http.post(environment.baseUrl+'invoice/reviewedUpadte',obj);
 
  }
  SaveCharges(data){
    return this.http.post(environment.baseUrl+'invoice/SaveCharges',data)

  }
  getAllCharges(){
    return this.http.get(environment.baseUrl+'invoice/getAllCharges');


  }
  resetpassword(obj){
    return this.http.post(environment.baseUrl+'invoice/resetPassword',obj);
 
  }
  getAllNotification(){
    return this.http.get(environment.baseUrl+'invoice/getAllNotification');
 
  }
  verifyedAndUpdated(obj){
    return this.http.post(environment.baseUrl+'invoice/verifyedAndUpdated',obj);
 
  }
  deteleGlobal(obj){
    return this.http.post(environment.baseUrl+'invoice/deteleGlobal',obj);
 
  }

}
