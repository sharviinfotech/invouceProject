import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralserviceService } from 'src/app/generalservice.service'; 
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-service-charges',
  templateUrl: './service-charges.component.html',
  styleUrls: ['./service-charges.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  standalone: true
})
export class ServiceChargesComponent implements OnInit {
  chargesForm: FormGroup;
  allCharges: any[] = []; // Initialize as an empty array
  submit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private service: GeneralserviceService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.chargesForm = this.fb.group({
      chargesName: ['', Validators.required]
    });
    this.getAllCharges(); // Fetch charges when the component initializes
  }

  get chargesName() {
    return this.chargesForm.get('chargesName');
  }

  SaveCharges() {
    if (this.chargesName.invalid) {
      this.submit = true;
      return;
    }

    let data = {
      chargesName: this.chargesName.value.toUpperCase(),
    };

    this.service.SaveCharges(data).subscribe((res: any) => {
      if (res.status === 200) {
        this.getAllCharges(); // Refresh the list after saving
        this.chargesForm.reset(); // Reset the form
          Swal.fire({
                    text: res.message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                  }).then(() => {
                    
                  });
        
      } else {
        this.toastr.error('Failed to save charge.');
      }
    }, error => {
      this.toastr.error('An error occurred while saving the charge.');
      console.error("Error saving charge:", error);
    });
  }

  getAllCharges() {
    this.service.getAllCharges().subscribe((res: any) => {
      this.allCharges = res.data; // Update the allCharges array with the fetched data
    }, error => {
      console.error("Error fetching charges:", error);
    });
  }
}