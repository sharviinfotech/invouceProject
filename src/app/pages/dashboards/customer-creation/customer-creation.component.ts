import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralserviceService } from 'src/app/generalservice.service'; // Adjust path if necessary
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-customer-creation',
  templateUrl: './customer-creation.component.html',
  styleUrl: './customer-creation.component.css',
  imports: [CommonModule, ReactiveFormsModule, FormsModule,NgxSpinnerModule],
  standalone: true
})
export class CustomerCreationComponent {
  @ViewChild('editCustomerTemplate') editCustomerTemplate!: TemplateRef<any>;
  creditPeriodList: string[] = ['15 days', '30 days', '45 days'];
   
  statesList: any[] = [];
  
   CreateCustomer: any[] = [];
   selectedCustomer: any = null;
   modalRef: any;
   customerEditModal: any;
  
  
   fieldTextType: boolean = false;
   submitted = false;
 confirmFieldTextType: boolean = false;
   customerNewCreation: any[];
   customerList: any[];
   submit: boolean=false;
   customerUniqueId: any;
   loginData: any;
   StateName: string;

 CustomerCreationForm: any;
newCustomerTemplate: any;
 customerEditForm: any;
 // spinner: any;

  
  

   constructor(
     private modalService: NgbModal,
     private fb: FormBuilder,
     private service: GeneralserviceService,private toastr: ToastrService,private spinner:NgxSpinnerService
   ) {}
  
   ngOnInit(): void {
     this.getStates();
     this.CustomerCreationForm = this.fb.group({
       customerName: ['', Validators.required],
       customerAddress: ['', Validators.required],
       customerCity: ['', Validators.required],
       customerState: ['', Validators.required],
       customerPincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
       customerGstNo: ['', Validators.required],
       customerPanNo:  ['',
        Validators.required,
        Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)  // Correct PAN format
      ],
    
       customerEmail: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
       customerContact: ['', [Validators.required,  Validators.pattern('^[0-9]{10}$')]],
       customerAlernativecontact: ['',[Validators.pattern('^[0-9]{10}$')]],
       customerCreditPeriod: ['', Validators.required]


     });
  
    


     this.customerEditForm = this.fb.group({

       customerName: ['', Validators.required],
       customerAddress: ['', Validators.required],
       customerCity: ['', Validators.required],
       customerState: ['', Validators.required],
       customerPincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]], // Assuming 6-digit pincode
       customerGstNo: ['', Validators.required],
       customerPanNo:  ['',
        Validators.required,
        Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)  // Correct PAN format
      ],
       customerEmail: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
       customerContact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
       customerAlernativecontact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
       customerCreditPeriod: ['', Validators.required]


     }, {
       // validator: this.mustMatch('password', 'confirmPassword')
     });
    
     this.getInvoiceCustomerDetails();
     this.getAllCustomerList();
    
    
     this.loginData = this.service.getLoginResponse()
   }
   editCustomer(selectedCustomer: any, content: any) {
     console.log('selectedCustomer:', selectedCustomer); // Debugging

     if (!selectedCustomer) {
       console.error('No customer data found');
       return;
     }
   }
   
   
   openEditModal(customer: any, editCustomerTemplate: TemplateRef<any>): void {
     this.submit = false
     console.log('customer',customer);
     this.customerUniqueId =null
     const selectedCustomer = customer;
     this.customerUniqueId = customer.customerUniqueId
     this.customerEditForm.patchValue({
       customerName: selectedCustomer.customerName,
       customerAddress: selectedCustomer.customerAddress,
       customerCity: selectedCustomer.customerCity,
       customerState: selectedCustomer.customerState,
       customerPincode: selectedCustomer.customerPincode,
       customerGstNo: selectedCustomer.customerGstNo,
       customerPanNo:selectedCustomer.customerPanNo,
       customerEmail:selectedCustomer.customerEmail,
       customerContact: selectedCustomer.customerContact,
       customerAlernativecontact: selectedCustomer.customerAlernativecontact,
       customerCreditPeriod:selectedCustomer.customerCreditPeriod

     });
     this.modalService.open(this.editCustomerTemplate, {
       backdrop: 'static',
       keyboard: false ,size:'lg'
     });  }
   getStates() {
     console.log("state ")
     this.spinner.show();
     this.service.getstateList().subscribe(
       (response: any) => {
         this.spinner.hide()
         if (response && response.responseData) {
           this.statesList = response.responseData.data;
         }
       },
       (error) => {

         console.error('Error fetching statesList:', error);
       }
     );
   }
  


  
  
  

  
   toggleFieldTextType() {
     this.fieldTextType = !this.fieldTextType;
   }
   toggleConfirmFieldTextType() {
     this.confirmFieldTextType = !this.confirmFieldTextType;
   }
   toggleStatus(): void {
     this.customerEditForm.patchValue({ status: !this.customerEditForm.value.status });
   }


  
   getInvoiceCustomerDetails(): void {
    
   }
  
   newCustomerCreation(newCustomerTemplate: any): void {
    
     this.modalService.open(newCustomerTemplate,{  backdrop: 'static',
       keyboard: false,size:'lg' });

  
   }
   get f() {
      return this.CustomerCreationForm.controls;
      }
      

  
  

      savecustomerCreation(model:any) {
      console.log('Create Customer:', this.CustomerCreationForm.value);
        
          if (this.CustomerCreationForm.invalid == true) {
            this.submit = true;
            return;
          } else {
            this.submit = true;
          }
        
          let creatObj = {
            "customerName": this.CustomerCreationForm.value.customerName,
            "customerAddress": this.CustomerCreationForm.value.customerAddress,
            "customerCity": this.CustomerCreationForm.value.customerCity,
            "customerState": this.CustomerCreationForm.value.customerState,
            "customerPincode": this.CustomerCreationForm.value.customerPincode,
            "customerGstNo": this.CustomerCreationForm.value.customerGstNo,
            "customerPanNo": this.CustomerCreationForm.value.customerPanNo,
            "customerEmail":this.CustomerCreationForm.value.customerEmail,
            "customerContact":this.CustomerCreationForm.value.customerContact,
            "customerAlernativecontact":this.CustomerCreationForm.value.customerAlernativecontact,
            "customerCreditPeriod":this.CustomerCreationForm.value.customerCreditPeriod


          
          };
        
          console.log("creatObj", creatObj);
        
          this.service.savecustomerCreation(creatObj).subscribe((res: any) => {
            console.log("submitCustomerForm", res);
            console.log('apiErr', res, res.responseData);
      
            if(res.status == 400){
              this.toastr.success(res.message);
            }else{
               // Display success toast
               this.CustomerCreationForm.reset()
            this.modalService.dismissAll(model);
            Swal.fire({
              title: '',
              text: res.message,
              icon: 'success',
              cancelButtonText: 'Ok'
            }).then((result) => {
              if (result) {
        
              } else {
        
              }
            });
            }
        
          
        
            this. getAllCustomerList();
            // this.modalService.dismissAll(modal);
            this.submitted = true;
          }, error => {
              this.toastr.error(error)
            // this.modalService.dismissAll(modal);
            console.log("error", error);
          });
        }
   c(message: string) {
     // Handle the close logic here
     console.log(message);
     // You might want to close the modal or clear form fields, etc.
   }
   updateExitCustomer(modal: any): void {
       if (this.customerEditForm.valid) {
         console.log('Updated Data:', this.customerEditForm.value);
         // Here, you would typically send the updated data to the backend
      
    
        
         let updateObj = {
           "customerUniqueId": this.customerUniqueId, // Assuming the unique ID is part of the form
           "customerName": this.customerEditForm.value.customerName,
           "customerAddress": this.customerEditForm.value.customerAddress,
           "customerCity": this.customerEditForm.value.customerCity,
           "customerState": this.customerEditForm.value.customerState,
           "customerPincode": this.customerEditForm.value.customerPincode,
           "customerGstNo": this.customerEditForm.value.customerGstNo,
           "customerPanNo": this.customerEditForm.value.customerPanNo,
           "customerEmail": this.customerEditForm.value.customerEmail,
           "customerContact":this.customerEditForm.value.customerContact,
           "customerAlernativecontact":this.customerEditForm.value.customerAlernativecontact,
           "customerCreditPeriod":this.customerEditForm.value.customerCreditPeriod

           
        
  
         };
        
         console.log("updateObj", updateObj);
        
         this.service. updateExitCustomer(updateObj,this.customerUniqueId).subscribe((res: any) => {
           console.log("updateCustomerCreation", res);
    
           if (res.status == 400) {
             this.toastr.success(res.message);
           } else {
             // Display success toast
             this.modalService.dismissAll(modal);
             Swal.fire({
               title: '',
               text: res.message,
               icon: 'success',
               cancelButtonText: 'Ok'
             }).then((result) => {
               if (result) {
                 // Handle confirmation if needed
               } else {
                 // Handle cancel if needed
               }
             });
           }
           this.customerEditForm.reset()
           this.getAllCustomerList();
          
           this.submitted = false;
         }, error => {
           this.toastr.error(error);
           console.log("error", error);
         });
       } else {
         console.log('Form is invalid');// Ensure all fields are marked as touched
       }
     }
   getAllCustomerList(){
     this.customerList = [];
     this.service.getAllCustomerList().subscribe((res:any)=>{
       this.customerList = res.data
       console.log("this.customerList",this.customerList)
     },error =>{
     console.log("error",error)
     })
   }

}
