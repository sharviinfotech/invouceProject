import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';
import { login } from 'src/app/store/Authentication/authentication.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { GeneralserviceService } from 'src/app/generalservice.service';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-login2',
  templateUrl: './login2.component.html',
  styleUrls: ['./login2.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlickCarouselModule]
})
/**
 * Login-2 component
 */
export class Login2Component implements OnInit {
  fieldTextType !: boolean;
  images = [
    // 'assets/images/worldMapImage.png',
    // 'assets/images/AircraftFlight.png',
    'assets/images/boardingpass.jpg',
    'assets/images/flightparking.jpg',
    'assets/images/flightHalf.jpg',
    // 'assets/images/airportfromflightstepdown.png',
    'assets/images/aircraftinsky.png',


  ];
  currentIndex = 0;
  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService,
    private authFackservice: AuthfakeauthenticationService, public store: Store, private service: GeneralserviceService, private toaster: ToastrService) { }
  loginForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  returnUrl: string;

  // set the currenr year
  year: number = new Date().getFullYear();

  ngOnInit(): void {
    document.body.classList.add("auth-body-bg");
    this.loginForm = this.formBuilder.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }, 5000); // Change image every 5 seconds
  }

  // swiper config
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: true
  };

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  // dynamic login below 
  onSubmit() {

    if(this.loginForm.invalid == true){
      this.submitted = true;
    }else{
      const userName = this.f['userName'].value; // Get the username from the form
      const password = this.f['password'].value; // Get the password from the form
  
      // Login Api
      // this.store.dispatch(login({ userName: userName, password: password }));
  
      this.login(userName, password)
    }
    

   
  }

  // local login without API
  // onSubmit() {
 
  //   if(this.loginForm.invalid == true){
  //     this.submitted = true;
  //   }else{
  //     const userName = this.f['userName'].value; // Get the username from the form
  //     const password = this.f['password'].value; // Get the password from the form
 
  //     // Login Api
  //     // this.store.dispatch(login({ userName: userName, password: password }));
     
  //       const  response   ={
  //           "message": "Login Successful",
  //           "status": 200,
  //           "data": {
  //               "userName": "1919",
  //               "userEmail": "sunil@gmail.com",
  //               "userUniqueId": 50,
  //               "userStatus": true,
  //               "isValid": true,
  //               "userActivity": "admin"
  //           },
  //           "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTA3NzJiMDg1ZjM5ODNkYWQ3N2Y1MyIsInVzZXJOYW1lIjoiMTkxOSIsImlhdCI6MTczODY1MzQyMiwiZXhwIjoxNzM4NjU3MDIyfQ.eljCCW-80W4gWJt0GhJPayd76Xmi7EZOFoOh3SRCP2I"
  //       }
  //         this.service.setLoginResponse(response);
  //         localStorage.setItem('currentUser', JSON.stringify(response || { token: response.token }));
  //         const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  //         this.router.navigate([returnUrl], { skipLocationChange: true });
 
  //     // this.login(userName, password)
  //   }
   
 
   
  // }
 
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
  //  login(userName: string, password: string){
  //       const loginPayload = {
  //         userName: userName,
  //         userPassword: password
  //       };
  //     this.service.submitLogin(loginPayload).subscribe((response:any)=>{
  //       if (response.status === 200 && response.isValid) {
  //         localStorage.setItem('token', response.token); // Store token in localStorage
  //         // Login Api
  //         this.store.dispatch(login({ userName: userName, password: password }));
  //         Swal.fire({
  //           // title: 'question',
  //           text: response.message,
  //           icon: 'info',
  //           showCancelButton: true,
  //           showConfirmButton: true,
  //         }).then((result) => {

  //         });
  //         this.store.dispatch(login({ userName: userName, password: password }));
  //         // return response;
  //       } else {
  //         console.log("response",response)
  //          Swal.fire({
  //                   // title: 'question',
  //                   text: response.message,
  //                   icon: 'info',
  //                   showCancelButton: true,
  //                   showConfirmButton: true,
  //                 }).then((result) => {
  //                   if (result.isConfirmed) {

  //                   } else {

  //                   }
  //                 });
  //       }
  //     })
  //       // return this.http.post<any>(this.apiUrl, loginPayload).pipe(
  //       //   map((response) => {
  //       //     console.log("response",response)
  //       //     if (response.status === 200 && response.isValid) {
  //       //       localStorage.setItem('token', response.token); // Store token in localStorage
  //       //       // Login Api
  //       //       this.store.dispatch(login({ userName: userName, password: password }));
  //       //       // return response;
  //       //     } else {
  //       //       console.log("response",response)
  //       //       throw new Error('Invalid credentials');
  //       //     }
  //       //   }),
  //       //   // catchError((error) => throwError(() => new Error(error.error?.message || 'Login failed')))
  //       // );
  //     }


  login(userName, password) {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }
    const loginPayload = {
      userName: userName,
      userPassword: password
    };

    // this.store.dispatch(login({ userName: userID, password: password }));

    this.service.submitLogin(loginPayload).subscribe((res: any) => {
        const response = res
        console.log("this.response", response)
        // if (this.response.MSGTXT) {
        
        if (response.status === 200 && response.data.isValid) {
          const dummy = "Welcome to GRN"
          // localStorage.setItem('currentUser', JSON.stringify(this.response.MSGTXT || { token: this.response.token }));
          localStorage.setItem('currentUser', JSON.stringify(response || { token: response.token }));
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigate([returnUrl], { skipLocationChange: true });
          this.service.setLoginResponse(response);
          // Swal.fire("",this.response.MSGTXT, "success")
          // Swal.fire("",dummy, "success")
          setTimeout(() => {
            Swal.fire(response.message, `Welcome ${response.data.userFirstName}  ${response.data.userLastName}`, 'success');

          }, 200);
          this.submitted = false;
        } 
        else if (response.status === 200 && response.data.isValid == false){
          Swal.fire('Login Failed', `${response.message} `, 'error');
          // Swal.fire("",dummy, "success")
          this.submitted = false;
        }
        else {
          Swal.fire("", "Invalid login credentials!", "error")
          // this.error = 'Invalid login credentials!';
        }
    },error=>{
      console.log("error",error)
      this.toaster.error(error)
     
    });
  }

}
