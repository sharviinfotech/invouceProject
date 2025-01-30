import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { NgxPrintModule } from 'ngx-print';
@Component({
  selector: 'app-invoice-reports',
  templateUrl: './invoice-reports.component.html',
  styleUrl: './invoice-reports.component.css',
  imports: [CommonModule, FormsModule,NgxPrintModule],
  standalone: true
  
})
export class InvoiceReportsComponent {
  allInvoiceList: any;
  invoice = {
    invoiceNumber: 'INV-5678',
    invoiceDate: '2025-01-25',
    header: {
      toName: 'John Doe'
    },
    amount: '$500'
  };
constructor(private service:GeneralserviceService,private spinner: NgxSpinnerService) {
   
 
  }
  ngOnInit(): void {
    this.getAllInvoice()
      }

  getAllInvoice(){
    this.allInvoiceList = []
    this.spinner.show()
    this.service.getAllInvoice().subscribe((res:any)=>{
      console.log("getAllInvoice",res);
      this.spinner.hide()
      this.allInvoiceList = res.invoices;
    },error =>{
      this.spinner.hide()
    })
  }
  selectInvoice(data){
    console.log("data",data)

  }
}
