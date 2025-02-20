import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { LanguageService } from '../../core/services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { changesLayout } from 'src/app/store/layouts/layout.actions';
import { getLayoutMode } from 'src/app/store/layouts/layout.selector';
import { RootReducerState } from 'src/app/store';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SimplebarAngularModule } from 'simplebar-angular';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  standalone:true,
  imports:[CommonModule,TranslateModule,BsDropdownModule,SimplebarAngularModule,ReactiveFormsModule],
})

/**
 * Topbar component
 */
export class TopbarComponent implements OnInit {
  mode: any
  element: any;
  cookieValue: any;
  flagvalue: any;
  countryName: any;
  valueset: any;
  theme: any;
  layout: string;
  dataLayout$: Observable<string>;
  loginData: any;
  isResetPasswordModalOpen = false;
  userUniqueId: any;
  spinner: any;
  submitted: boolean;
 
  resetPassword!: FormGroup;
  // Define layoutMode as a property

  constructor(@Inject(DOCUMENT) private document: any,private fb: FormBuilder, private router: Router, private authService: AuthenticationService,
    private authFackservice: AuthfakeauthenticationService,
    public languageService: LanguageService,
    public translate: TranslateService,
    private toaster: ToastrService,
    public _cookiesService: CookieService, public store: Store<RootReducerState>, private toastr: ToastrService,private service:GeneralserviceService) {

  }

  listLang: any = [
    { text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en' },
    { text: 'Spanish', flag: 'assets/images/flags/spain.jpg', lang: 'es' },
    { text: 'German', flag: 'assets/images/flags/germany.jpg', lang: 'de' },
    { text: 'Italian', flag: 'assets/images/flags/italy.jpg', lang: 'it' },
    { text: 'Russian', flag: 'assets/images/flags/russia.jpg', lang: 'ru' },
  ];

  openMobileMenu: boolean;

  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();

  ngOnInit() {


    // this.initialAppState = initialState;
    this.store.select('layout').subscribe((data) => {
      this.theme = data.DATA_LAYOUT;
    })
    this.openMobileMenu = false;
    this.element = document.documentElement;

    this.cookieValue = this._cookiesService.get('lang');
    const val = this.listLang.filter(x => x.lang === this.cookieValue);
    this.countryName = val.map(element => element.text);
    if (val.length === 0) {
      if (this.flagvalue === undefined) { this.valueset = 'assets/images/flags/us.jpg'; }
    } else {
      this.flagvalue = val.map(element => element.flag);
    }

   this.loginData= this.service.getLoginResponse()
   console.log("this.loginData",this.loginData);
   this.resetPassword = this.fb.group({ 
    userName: ['', [Validators.required]], 
    currentPassword: ['', [Validators.required]], 
    newPassword: ['', [Validators.required]], 
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });
   if(this.loginData == undefined){
    this.router.navigate(['/auth/login-2'],);
   }
  }

  get f() {
    return this.resetPassword.controls;
    }
  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
  }

  /**
   * Toggles the right sidebar
   */
  toggleRightSidebar() {
    this.settingsButtonClicked.emit();
  }
  isLogoutDropdownOpen = false;

  toggleLogoutDropdown() {
    this.isLogoutDropdownOpen = !this.isLogoutDropdownOpen;
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  /**
   * Logout the user
   */
  logout() {
    if (environment.defaultauth === 'firebase') {
      this.authService.logout();
    } else {
      this.authFackservice.logout();
    }
    // this.router.navigate(['/auth/login']);
    this.router.navigate(['/auth/login-2'],);

  }

  /**
   * Fullscreen method
   */
  fullscreen() {
    document.body.classList.toggle('fullscreen-enable');
    if (
      !document.fullscreenElement && !this.element.mozFullScreenElement &&
      !this.element.webkitFullscreenElement) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        /* Firefox */
        this.element.mozRequestFullScreen();
      } else if (this.element.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.element.webkitRequestFullscreen();
      } else if (this.element.msRequestFullscreen) {
        /* IE/Edge */
        this.element.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }

  changeLayout(layoutMode: string) {
    this.theme = layoutMode;
    this.store.dispatch(changesLayout({ layoutMode }));
    this.store.select(getLayoutMode).subscribe((layout) => {
      document.documentElement.setAttribute('data-layout', layout)
    })
  }

  openResetPasswordModal() {
    console.log("this.loginData.userName",this.loginData.data.userName)
    this.isResetPasswordModalOpen = true;
    this.resetPassword.patchValue({
      "userName":this.loginData.data.userName
    })

console.log("this.resetPassword",this.resetPassword.value.userName)
}

closeResetPasswordModal() {
    this.isResetPasswordModalOpen = false;
   
}
     resetpasswordSave() {

    console.log("this.resetPasswordData",this.resetPassword)
    // this.spinner.show();
    
  
    if (this.resetPassword.invalid == true) {
      // this.spinner.hide();
      this.submitted = true;
      return;
    }
  
    const Payload = {
      userUniqueId:this.loginData.data.userUniqueId,
      userName: this.resetPassword.value.userName,
      currentPassword:this.resetPassword.value.currentPassword,
      newPassword:this.resetPassword.value.newPassword,
      confirmPassword:this.resetPassword.value.confirmPassword
    };
  
    this.service.resetpassword(Payload).subscribe(
      (res: any) => {
        const response = res;
  
        // First, stop the spinner
        // this.spinner.hide();
  
        // Ensure UI update completes before showing Swal
       
          if (response.status === 200) {
           
            // this.service.getLoginResponse(response);
  
            // Swal.fire(response.message, `Welcome ${response.data.userFirstName} ${response.data.userLastName}`, 'success');
            Swal.fire({
              title: response.message,
             
              icon: 'success',
              timer: 5000, // 10 seconds
              timerProgressBar: true, // Shows a progress bar
            });
            this.router.navigate(['/auth/login-2'],);
            this.submitted = false;
          } 
          
          else {
            this.toaster.error(res.message)
          }
  
          
        
      },
      (error) => {
        // this.spinner.hide();
  
        setTimeout(() => {
          console.log('error', error);
          this.toaster.error(error);
        }, 0);
      }
    );
  }
  
}