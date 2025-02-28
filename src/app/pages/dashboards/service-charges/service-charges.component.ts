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
  chargesUniqueId:number;

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
    this.spinner.show()
    this.service.SaveCharges(data).subscribe((res: any) => {
      this.spinner.hide()

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
      this.spinner.hide()

    });
  
  }
  
  delete(charge): void {
    console.log('Deleting Customer with ID:',charge);
    this.chargesUniqueId= null
  this.chargesUniqueId = charge.chargesUniqueId
    let deletePayload = {
      globalId: this.chargesUniqueId,
      screenName: "charges"
    };
  
    console.log("Delete payload:", deletePayload);
  this.spinner.show()
    this.service.deteleGlobal(deletePayload).subscribe((res: any) => {
        console.log("deleteGlobal response:", res);
        this.spinner.hide()
        if (res.status === 400) {
          this.toastr.error(res.message);
        } else {
          Swal.fire({
            title: 'succes',
            text: res.message,
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            this.getAllCharges();
          });
          // this.modalService.dismissAll();
         
        }
      },
      (error) => {
        this.spinner.hide()
        console.error("Error deleting customer:", error);
        this.toastr.error("Failed to delete customer");
      }
    );
  }
 

  getAllCharges() {
    this.spinner.show()
    this.service.getAllCharges().subscribe((res: any) => {
      this.allCharges = res.data; // Update the allCharges array with the fetched data
      this.spinner.hide()
    }, error => {
      console.error("Error fetching charges:", error);
      this.spinner.hide()

    });
  }
}