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
  userCreationForm: FormGroup;
  userEditForm!: FormGroup;
  userList: any[] = [];
  selectedUser: any;
  modalRef: any;
  fieldTextType: boolean = false;
  submitted = false;
confirmFieldTextType: boolean = false;
 


  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private service: GeneralserviceService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadDummyUsers();
    this.getInvoiceUserDetails(); // Fetch users from API
  }
  

  private loadDummyUsers(): void {
    this.userList = [
      { userName: 'john_doe', firstName: 'John', lastName: 'Doe', email: 'john@example.com', contact: '1234567890' },
      { userName: 'jane_smith', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', contact: '0987654321' },
      { userName: 'mark_wilson', firstName: 'Mark', lastName: 'Wilson', email: 'mark@example.com', contact: '9876543210' }
    ];
  }

  // Initialize Forms with Dummy Data for New User
  private initializeForms(): void {
    this.userCreationForm = this.fb.group({
      userName: ['new_user123', Validators.required],
      firstName: ['New', Validators.required],
      lastName: ['User', Validators.required],
      email: ['newuser@example.com', [Validators.required, Validators.email]],
      contact: ['1122334455', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]] 
    });
  
    


    this.userEditForm = this.fb.group({
      userName: ['new_user123'],
      firstName: ['New'],
      lastName: ['User'],
      email: ['newuser@gmail.com'],
      contact: ['1122334455', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['password123'],
      confirmPassword: ['']
    }, {
      // validator: this.mustMatch('password', 'confirmPassword')
    });
  }
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
  openEditModal(user: any,editUserTemplate): void {
    this.selectedUser = user;
    this.userEditForm.patchValue(user);
    this.modalService.open(editUserTemplate,{ size: 'lg', });
  }
  newUserCreation(newUserTemplate: any): void {
    
    this.modalService.open(newUserTemplate,{ size: 'lg'});
    // Handle the new user creation logic here
    console.log("New user template:", newUserTemplate);
    // You can add any additional logic like making API calls, etc.
  }
  

  // Update User Information
  updateUserCreation(close: any): void {
    if (this.userEditForm.valid) {
      Object.assign(this.selectedUser, this.userEditForm.value);
      Swal.fire('Updated!', 'User details updated successfully.', 'success');
      close();
    }
  }
  // submitNewUser() {
  //   this.submitted = true;
  //   if (this.userCreationForm.invalid) {
  //     return;
  //   }
  //   // Handle form submission logic
  // }

  submitNewUser(c: any): void {
    this.submitted = true;
    
    // If form is invalid, return
    if (this.userCreationForm.invalid) {
      return;
    }

    // Add your form submission logic here (e.g., API call)
    console.log(this.userCreationForm.value);
    c();
  }

  // Getters for form controls
  get f() {
    return this.userCreationForm.controls;
  }
}
