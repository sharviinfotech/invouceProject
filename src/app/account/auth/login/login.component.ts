import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { login } from 'src/app/store/Authentication/authentication.actions';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone:true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule]
})

/**
 * Login component
 */
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  returnUrl: string;
  fieldTextType!: boolean;

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService, private store: Store,
    private authFackservice: AuthfakeauthenticationService) { }

  ngOnInit() {
    if (localStorage.getItem('currentUser')) {
      this.router.navigate(['/']);
    }
    // form validation
    this.loginForm = this.formBuilder.group({
      email: ['admin@themesbrand.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required]],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;

    const email = this.f['email'].value; // Get the username from the form
    const password = this.f['password'].value; // Get the password from the form

    // Login Api
    this.store.dispatch(login({ email: email, password: password }));
  }

  // onSubmit() {
  //   this.submitted = true;

  //   const email = this.f['email'].value; 
  //   const password = this.f['password'].value; 
  //   if (email && password) {
  //     let obj ={
  //       userName:email,
  //       userPassword:password
  //     }
  //     this.authenticationService.login(obj).subscribe(
  //       (response:any) => {
  //         // handle successful login (e.g., store token, redirect)
  //         console.log('Login successful', response);
  //         if(response.status == 200 && response.isValid == true){
  //           this.router.navigate(['default']);
  //           this.store.dispatch(login({ email: email, password: password }));
  //         }else{
  //          console.log("response else",response)
  //         }

         
  //       },
  //       (error) => {
  //         // handle login failure (e.g., show error message)
  //         console.error('Login failed', error);
  //       }
  //     );
  //   }

  //   // Login Api
  //   // this.store.dispatch(login({ email: email, password: password }));
  // }

  /**
 * Password Hide/Show
 */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
