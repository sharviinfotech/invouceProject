import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralserviceService } from 'src/app/generalservice.service'; // Adjust path if necessary
import Swal from 'sweetalert2';

@Component({
  selector: 'app-invoice-user-creation',
  templateUrl: './invoice-user-creation.component.html',
  styleUrls: ['./invoice-user-creation.component.css']
})
export class InvoiceUserCreationComponent implements OnInit {
  @ViewChild('editUserTemplate') editUserTemplate!: TemplateRef<any>;

  // invoiceUserCreationForm!: FormGroup;
  userCreationForm!: FormGroup;
  userEditForm!: FormGroup;
  CreateUser: any[] = [];
  selectedUser: any;
  modalRef: any;
  fieldTextType: boolean = false;
  submitted = false;
confirmFieldTextType: boolean = false;
  userNewCreation: any[];
  userList: any[];
  
 


  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private service: GeneralserviceService
  ) {}

  ngOnInit(): void {
    this.userCreationForm = this.fb.group({
      userName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      activity: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]] ,
      status: ['']
    });
  
    


    this.userEditForm = this.fb.group({
      userName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      activity: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      status: ['']
    }, {
      // validator: this.mustMatch('password', 'confirmPassword')
    });
    // this.loadDummyUsers();
    this.getInvoiceUserDetails(); // Fetch users from API
    this.getAllUserList()
  }
  

  // private loadDummyUsers(): void {
  //   this.userList = [
  //     { userName: 'john_doe', firstName: 'John', lastName: 'Doe', email: 'john@example.com', contact: '1234567890' },
  //     { userName: 'jane_smith', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', contact: '0987654321' },
  //     { userName: 'mark_wilson', firstName: 'Mark', lastName: 'Wilson', email: 'mark@example.com', contact: '9876543210' }
  //   ];
  // }

  // Initialize Forms with Dummy Data for New User

  // passwordMatchValidator(control: any): { [key: string]: boolean } | null {
  //   if (this.editUserTemplate && control.value !== this.editUserTemplate.get('password')?.value) {
  //     return { mustMatch: true };
  //   }
  //   return null;
  // }
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
  toggleConfirmFieldTextType() {
    this.confirmFieldTextType = !this.confirmFieldTextType;
  }
  toggleStatus(): void {
    this.userEditForm.patchValue({ status: !this.userEditForm.value.status });
  }


  
  // Password match validator function
  // mustMatch(controlName: string, matchingControlName: string) {
  //   return (formGroup: FormGroup) => {
  //     const control = formGroup.controls[controlName];
  //     const matchingControl = formGroup.controls[matchingControlName];
  
  //     if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
  //       return;
  //     }
  
  //     if (control.value !== matchingControl.value) {
  //       matchingControl.setErrors({ mustMatch: true });
  //     } else {
  //       matchingControl.setErrors(null);
  //     }
  //   };
  // }
  
  // Fetch users from API
  getInvoiceUserDetails(): void {
    // this.service.userList().subscribe({
    //   next: (res: any) => {
    //     this.userList = res.responseData.data || [];
    //     console.log('User List:', this.userList);
    //   },
    //   error: (error) => {
    //     console.error('Error fetching user details:', error);
    //   }
    // });
  }

  // Open Edit Modal
  openEditModal(user: any, editUserTemplate: TemplateRef<any>): void {
    this.selectedUser = user;
    this.userEditForm.patchValue(user);
    this.modalService.open(editUserTemplate, { size: 'lg'});
  }
  newUserCreation(newUserTemplate: any): void {
    
    this.modalService.open(newUserTemplate,{ size: 'lg'});
    
  }
  get f() {
     return this.userCreationForm.controls;
     }

  // Update User Information
  updateUserCreation(modal: any): void {
    if (this.userEditForm.valid) {
      console.log('Updated User:', this.userEditForm.value);
      modal.close();
    } else {
      this.userEditForm.markAllAsTouched();
    }
  }
  // submitNewUser() {
  //   this.submitted = true;
  //   if (this.userCreationForm.invalid) {
  //     return;
  //   }
  //   // Handle form submission logic
  // }

  submitUserForm(modal: any) {

    if (this.userCreationForm.valid) {
      console.log('Create User:', this.userCreationForm.value);
      modal.close();
    } else {
      this.userCreationForm.markAllAsTouched();
    }
  
    this.submitted = true;
    let creatObj ={
      "userName":this.userCreationForm.value.userName,
      "userFirstName":this.userCreationForm.value.userfirstName,
      "userlastName":this.userCreationForm.value.userlastName,
      "useremail":this.userCreationForm.value.email,
      "usercontact":this.userCreationForm.value.contact,
      "userpassword":this.userCreationForm.value.password,
      "userconfirmPassword":this.userCreationForm.value.confirmPassword,
      "function":this.userCreationForm.value.function,
      "userStatus": this.userCreationForm.value.status,
      "userActivity": this.userCreationForm.value.admin
      }
      console.log("creatObj",creatObj)
    this.service.userNewCreation(creatObj).subscribe((res:any)=>{
      console.log("submitUserForm",res)
      console.log('apiErr',res,res.responseData) ;
      Swal.fire({
              title: '',
              text: res.message,
              icon: 'success',
              // showCancelButton: true,
              // confirmButtonText: 'Yes, Logout!',
              cancelButtonText: 'Ok'
            }).then((result) => {
              if (result) {
                
              } else {
                
              }
            });
            this.getAllUserList()
            this.modalService.dismissAll(modal);
           
    },error =>{
      this.modalService.dismissAll(modal);
      console.log("error",error)

    })
    
  }
  getAllUserList(){
    this.userList = [];
    this.service.getAllUserList().subscribe((res:any)=>{
      this.userList = res.usersList
      console.log("this.userList",this.userList)
    },error =>{
    console.log("error",error)
    })
  }
}
