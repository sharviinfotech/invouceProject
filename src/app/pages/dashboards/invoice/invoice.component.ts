import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css',
  imports:[CommonModule,ReactiveFormsModule,FormsModule,],
  standalone:true
})
export class InvoiceComponent {
  newInvoiceCreation!:FormGroup
  showNewInvoice = false;
  activeTab = null;
  logoUrl: string | null = null;
  items: any[] = [{
    description: '',
    additionalDetails: '',
    rate: 0,
    quantity: 1,
    showActions: false,
    showDetails: false
  }];

  tax = 0;
  total = 0;
  mainHours: string = '03.15';
  mainRate: number = 145000;
  chargeItems: ChargeItem[] = [
    {
      description: 'SHAMSHABAD-CHENNAI-SHAMSHABAD',
      rate: 105000,
      amount: 471250
    },
    {
      description: 'Ground Handling & Airport Charges',
      amount: 105000
    },
    {
      description: 'Crew B/L/T',
      amount: 0
    }
  ];

  taxItems: TaxItem[] = [
    {
      description: 'CGST @ 9%',
      percentage: 9,
      amount: 51863
    },
    {
      description: 'SGST/UDST @ 9%',
      percentage: 9,
      amount: 51863
    },
    {
      description: 'IGST @ 18%',
      percentage: 18,
      amount: 0
    }
  ];

  subtotal: number = 576250;
  grandTotal: number = 679975;
  amountInWords: string = 'Six Lakhs Seventy Nine Thousand Nine Hundred Seventy Five Only.';
  constructor(private fb: FormBuilder,){

  }
  ngOnInit(): void {
    this.newInvoiceCreation = this.fb.group({
      invoiceHeader:[''],
      fromName: [''],
      fromEmail: [''],
      fromAddress: [''],
      fromMobileNumber: [''],
      toName:[''],
      toEmail: [''],
      toAddress: [''],
      toMobileNumber: [''],
      toGstinNo: [''],
      toPan: [''],
      invoiceNumber: [''],
      invoiceDate: [''],
      panNumber: [''],
      gstinNo:[''],
      typeOfAircraft:[''],
      notes:['']
        });
        
  }
  // addItem() {
  //   this.items.push({
  //     description: '',
  //     additionalDetails: '',
  //     rate: 0,
  //     quantity: 1,
  //     showActions: false,
  //     showDetails: false
  //   });
  // }

  // refreshRow(index: number) {
  //   this.items[index] = {
  //     description: '',
  //     additionalDetails: '',
  //     rate: 0,
  //     quantity: 1,
  //     showActions: false,
  //     showDetails: false
  //   };
  //   this.calculateTotal();
  // }

  // deleteRow(index: number) {
  //   if (this.items.length > 1) {
  //     this.items.splice(index, 1);
  //     this.calculateTotal();
  //   }
  // }

  // calculateTotal() {
  //   this.subtotal = this.items.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
  //   this.tax = this.subtotal * 0.1; // 10% tax rate
  //   this.total = this.subtotal + this.tax;
  // }
 


  // toggleNewInvoice() {
  //   this.showNewInvoice = !this.showNewInvoice;
  //   console.log("this.showNewInvoice",this.showNewInvoice)

  // }

  setTab(tabName: string) {
    this.activeTab = tabName;
    console.log("this.activeTab",this.activeTab);
  }
  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoUrl = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
  removeLogo(event: Event) {
    event.stopPropagation(); // Prevent the click from triggering the file input
    this.logoUrl = null;
  }
  saveInvoice(){
    console.log("this.newInvoiceCreation",this.newInvoiceCreation.value)
  }
  addChargeItem() {
    this.chargeItems.push({
      description: '',
      rate: 0,
      amount: 0
    });
  }

  addTaxItem() {
    this.taxItems.push({
      description: '',
      percentage: 0,
      amount: 0
    });
  }

  calculateTotals() {
    // Calculate subtotal
    this.subtotal = this.chargeItems.reduce((sum, item) => sum + (item.amount || 0), 0);

    // Calculate tax amounts
    this.taxItems.forEach(tax => {
      tax.amount = Math.round(this.subtotal * (tax.percentage / 100));
    });

    // Calculate grand total
    this.grandTotal = this.subtotal + this.taxItems.reduce((sum, tax) => sum + tax.amount, 0);

    // Update amount in words (you may want to add a proper number to words converter)
    this.amountInWords = this.numberToWords(this.grandTotal);
  }

  numberToWords(num: number): string {
    // This is a simplified version. You may want to implement a more comprehensive converter
    return `${num.toLocaleString('en-IN')} Only.`;
  }
  
}
