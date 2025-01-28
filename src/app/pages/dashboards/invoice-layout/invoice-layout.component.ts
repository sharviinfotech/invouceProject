import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder,FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
interface ChargeItem {
  description: string;
  hours?: string;
  rate?: number;
  amount: number;
}
 
interface TaxItem {
  description: string;
  percentage: number;
  amount: number;
}


@Component({
  selector: 'app-invoice-layout',
  templateUrl: './invoice-layout.component.html',
  styleUrl: './invoice-layout.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true
})
export class InvoiceLayoutComponent {
  showImage1: boolean = false;     
  showImage2: boolean = false;  

openDialog(arg0: string) {
throw new Error('Method not implemented.');
}
  activeTab: string = '';  // This will hold the name of the active tab
 
  // Form group and other variables
  newInvoiceCreation: FormGroup; // Assuming you're using Angular Reactive Forms
  logoUrl: string;
  isHoveringLogo: boolean = false;
  isHoveringRemove: boolean = false;
  amountInWords: string;
  subtotal: number = 0;
  grandTotal: number = 0;
 
  constructor(private fb: FormBuilder) {
    // Initialize the form group
    this.newInvoiceCreation = this.fb.group({
      invoiceHeader: [''],
      fromName: [''],
      fromEmail: [''],
      fromAddress: [''],
      fromMobileNumber: [''],
      toName: [''],
      toEmail: [''],
      toAddress: [''],
      toMobileNumber: [''],
      toGstinNo: [''],
      toPan: [''],
      invoiceNumber: [''],
      invoiceDate: [''],
      panNumber: [''],
      gstinNo: [''],
      typeOfAircraft: [''],
      notes: [''],
      TypeOfTransfer: [''],
      bankName: [''],
      AccountNo: [''],
      BranchName: [''],
      IfscCode: [''],
    });
  }
 
  // Function to set active tab
  setActiveTab(tab: string) {
    this.activeTab = tab;
    console.log("this.activeTab",this.activeTab)
  }
 
  // Other methods for file upload, logo removal, and invoice calculations
  onLogoSelected(event: any) {
    // handle logo selection
  }
 
  removeLogo(event: any) {
    this.logoUrl = '';
  }
 
  saveInvoice() {
    // Logic to save the invoice
  }
 
  // Add more logic for charge items, tax calculation, etc.
  activeTemplate: string = 'template1';
    
}
