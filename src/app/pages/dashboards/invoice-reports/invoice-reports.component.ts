import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { NgxPrintModule } from 'ngx-print';
import Swal from 'sweetalert2';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ImageService } from 'src/app/image.service';

interface ChargeItem {
  description: string;
  units: string;
  rate: string;
  amount: string;
  _id: string;
}

interface TaxItem {
  description: string;
  percentage: string;
  amount: string;
  _id: string;
}

interface InvoiceHeader {
  invoiceHeader: string;
  invoiceImage: string;
  ProformaCustomerName: string;
  ProformaAddress: string;
  ProformaCity: string;
  ProformaState: string;
  ProformaPincode: string;
  ProformaGstNo: string;
  ProformaPanNO: string;
  ProformaInvoiceNumber: string;
  ProformaInvoiceDate: string;
  ProformaPan: string;
  ProformaGstNumber: string;
  ProformaTypeOfAircraft: string;
  ProformaSeatingCapasity: number;
  notes: string;
  BookingDateOfJourny: string;
  BookingSector: string;
  BookingBillingFlyingTime: string;
}

interface InvoiceItem {
  notes: any;
  tax: any;
  items: any;
  customerName: any;
  customerAddress: any;
  customerPhone: any;
  customerEmail: any;
  invoiceDate: any;
  invoiceNumber: any;
  header: InvoiceHeader;
  _id: string;
  invoiceReferenceNo: number;
  chargesList: ChargeItem[];
  taxList: TaxItem[];
  subtotal: number;
  grandTotal: number;
  amountInWords: string;
  status: string;
  invoiceUniqueNumber: string;
  proformaCardHeaderName:string
}
@Component({
  selector: 'app-invoice-reports',
  templateUrl: './invoice-reports.component.html',
  styleUrl: './invoice-reports.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPrintModule, BsDatepickerModule],
  standalone: true,
  // encapsulation: ViewEncapsulation.None

})
export class InvoiceReportsComponent {
  // @ViewChild('invoiceContent', { static: false }) invoiceContent!: ElementRef;
  bsConfig: Partial<BsDatepickerConfig>;
  invoiceItem: any;
  allInvoiceList: any;
  invoice = {
    invoiceNumber: 'INV-5678',
    invoiceDate: '2025-01-25',
    header: {
      toName: 'John Doe'
    },
    amount: '$500'
  };
  logoUrl: string;
  InvoiceLogo: string;
  reportsForm!: FormGroup;
  filteredInvoices: any;
  uniqueInvoices: any;
  submit: boolean = false;
  minToDate: Date | undefined;
  signature: string;
  loginData: any;
  grandTotalInvoices: any;
  constructor(private service: GeneralserviceService, private spinner: NgxSpinnerService, private imageService: ImageService, private fb: FormBuilder) {
    this.bsConfig = {
      dateInputFormat: 'DD-MM-YYYY',
      containerClass: 'theme-blue', // Optional: Customize theme
    };


  }
  ngOnInit(): void {
    this.loginData = this.service.getLoginResponse()
    console.log("this.loginData ", this.loginData)
    this.getAllInvoice()
    this.reportsForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      status: ['', Validators.required],
      invoiceType: ['', Validators.required],
    });
  }
  formatDate(proformaInvoiceDate: string): string {
    const date = new Date(proformaInvoiceDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }
  get f() {
    return this.reportsForm.controls;
  }
  onChangeForm() {

    if (this.reportsForm.value.fromDate && this.reportsForm.value.toDate && this.reportsForm.value.status && this.reportsForm.value.invoiceType) {
      this.filteredInvoices = [];  // Store or use the filtered data as needed
      const fromD = this.reportsForm.value.fromDate;
      const toD = this.reportsForm.value.toDate;
      const selectedStatus = this.reportsForm.value.status;
      const selectedInvoiceType = this.reportsForm.value.invoiceType; // Get selected invoice type
     console.log("this.reportsForm",this.reportsForm)
      // Convert fromDate and toDate to Date objects
      const fromDateObj = this.convertToDate(fromD);
      const toDateObj = this.convertToDate(toD);

      console.log('From Date:', fromDateObj);
      console.log('To Date:', toDateObj);
      console.log("this.uniqueInvoices", this.uniqueInvoices)
      // Filter invoices based on both date range and status
      const filteredInvoices = this.uniqueInvoices.filter(invoice => {
        // Convert invoice date string to Date object
        const invoiceDate = this.convertToDate(invoice.header.ProformaInvoiceDate);

        // Check if invoice date is within the specified range
        const isWithinDateRange = invoiceDate >= fromDateObj && invoiceDate <= toDateObj;

        // Check if the status matches (case insensitive)
        const isStatusMatch = selectedStatus === '' || invoice.status.toLowerCase() === selectedStatus.toLowerCase();
        const isInvoiceTypeMatch = selectedInvoiceType === '' || invoice.proformaCardHeaderId === selectedInvoiceType; // Filter by invoice type
        // Return only invoices that match both date range and status
        return isWithinDateRange && isStatusMatch && isInvoiceTypeMatch;
      });

      console.log('Filtered Invoices:', filteredInvoices);
      this.filteredInvoices = filteredInvoices;  // Store or use the filtered data as needed
      console.log('Filtered Invoices:', this.filteredInvoices);
      this.allInvoiceList = this.filteredInvoices
      console.log('this.allInvoiceList change', this.allInvoiceList);
      this.submit = false
    } else {
      console.log('this.uniqueInvoices', this.uniqueInvoices);
      this.submit = true
    }
    console.log('this.uniqueInvoices', this.uniqueInvoices);

  }
  reset() {
    this.reportsForm.reset()
    this.reportsForm.patchValue({
      "status": ''
    })
    this.getAllInvoice()
  }
  printData() {


    var  fromDate = this.reportsForm.value.fromDate
    var  toDate = this.reportsForm.value.toDate
    var  invoiceType = this.reportsForm.value.invoiceType
    var  status = this.reportsForm.value.status
    this.grandTotalInvoices = 0
    this.allInvoiceList.forEach(invoice => {
      this.grandTotalInvoices += invoice.grandTotal;
  });
    
    const invoiceHTML = `
    
<html>
<head>
 
  <style>
      
  
   .table-bordered {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 10px;
      // background-color:rgb(193, 205, 217); /* Added background color */
      font-size: 12px !important;
       border: 1px solid #ddd !important;
    }
     .table-bordered th {
      border: 1px solid #ddd;
    padding: 2px;
    background: rgb(88 98 145) !important;
    color: white;
    }
 
    .table-bordered td {
    padding: 2px;
    border: 1px solid #ddd;
    }
   
 
   
       
    .bold {
      font-weight: bold;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }

  

 

  @media print {
    
   body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 5px;
              background-color: white;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-size: 9px;
            }
              
       
            .table-bordered {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 10px;
      // background-color:rgb(193, 205, 217); /* Added background color */
      font-size: 13px !important;
       border: 1px solid #ddd !important;
    }
     .table-bordered th {
      border: 1px solid #ddd;
    padding: 2px;
    background: rgb(88 98 145) !important;
    color: white;
   
    }
 
    .table-bordered td {
    padding: 2px;
    border: 1px solid #ddd;
    }
   
 
   
       
    .bold {
      font-weight: bold;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
     tr {
    page-break-inside: avoid;
  }
  
  thead {
    display: table-header-group;
  }
  
  tfoot {
    display: table-footer-group;
  }


  </style>
</head>
<body>
  <div class="">
    <table class="table-bordered">
              <thead>
                  <tr>
            <th class="text-nowrap">Invoice Number</th>
            <th class="text-nowrap">Invoice Date</th>
            <th class="text-nowrap">Customer Name</th>
            <th class="text-nowrap">Type Of Aircraft</th>
            <th class="text-nowrap">City</th>
            <th class="text-nowrap">Destination</th>
            <th class="text-nowrap">Date Of Journey</th>
            <th class="text-nowrap">Total Amount</th>
            <th class="text-nowrap">Status</th>
            
              </thead>
              <tbody>
            
                ${this.allInvoiceList.map((invoice, index) => `
                  <tr>
                   
                     <td >${invoice.invoiceUniqueNumber}</td>
                    <td>${invoice.header.ProformaInvoiceDate}</td>
                    <td >${invoice.header.ProformaCustomerName}</td>
                    <td >${invoice.header.ProformaTypeOfAircraft}</td>
                    <td >${invoice.header.ProformaCity}</td>
                     <td>${invoice.header.BookingSector}</td>
                    <td >${invoice.header.startBookingDateOfJourny}/${invoice.header.endBookingDateOfJourny}</td>
                    <td >${invoice.grandTotal ? invoice.grandTotal.toFixed(2) : '0.00'}</td>
                    <td >${invoice.status}</td>

                  </tr>
                `).join('')}
               
                <tr>
                    <td ></td>
                    <td></td>
                    <td ></td>
                    <td ></td>
                    <td ></td>
                     <td></td>
                    <td </td>
                    <td >TOTAL</td>
                    <td >${this.grandTotalInvoices ? this.grandTotalInvoices.toFixed(2) : '0.00'}</td> </tr>
              </tbody>
            </table>

        </div>
   
  </div>
</body>
</html>
 
 
    `;
    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
    
      newWindow.onafterprint = function () {
        newWindow.close();
      };
    
      newWindow.onbeforeunload = function () {
        newWindow.close();
      };
    
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
    
  }
  

  // Helper method to convert date string to Date object
  convertToDate(dateString: any): Date {
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const [day, month, year] = dateString.split('-').map(val => parseInt(val, 10));
      return new Date(year, month - 1, day); // JS Date months are 0-indexed
    } else if (dateString instanceof Date) {
      return dateString;  // If the input is already a Date object, return it directly
    } else {
      console.error('Invalid date format:', dateString);
      return new Date(); // Return current date as fallback or handle accordingly
    }
  }




  isDateInRange(invoiceDate: string, fromDate: string, toDate: string): boolean {
    // Convert dates to comparable format (e.g., DD-MM-YYYY)
    const invoiceDateParts = invoiceDate.split('-');
    const fromDateParts = fromDate.split('-');
    const toDateParts = toDate.split('-');

    const invoiceDateObj = new Date(Number(invoiceDateParts[2]), Number(invoiceDateParts[1]) - 1, Number(invoiceDateParts[0]));
    const fromDateObj = new Date(Number(fromDateParts[2]), Number(fromDateParts[1]) - 1, Number(fromDateParts[0]));
    const toDateObj = new Date(Number(toDateParts[2]), Number(toDateParts[1]) - 1, Number(toDateParts[0]));

    return invoiceDateObj >= fromDateObj && invoiceDateObj <= toDateObj;
  }
  getAllInvoice() {
    this.allInvoiceList = []
    this.spinner.show()
    let obj={
      "userActivity":""
  }
    this.service.getAllInvoice(obj).subscribe((res: any) => {
      console.log("getAllInvoice", res);
      this.spinner.hide()
      this.allInvoiceList = res.data;
      this.uniqueInvoices = [...this.allInvoiceList];

      console.log("this.uniqueInvoices", this.uniqueInvoices)
    }, error => {
      this.spinner.hide()
    })
  }

// Method to select and show an invoice
selectInvoice(invoice: any) {
  this.invoiceItem = null
  this.invoiceItem = invoice
  const invoiceItem = invoice;
  console.log("invoice", invoice)
  console.log("this.invoiceItem", this.invoiceItem.invoiceReferenceNo);
  console.log("this.invoiceItem.header.status", this.invoiceItem.header.status)


  if (this.invoiceItem.status == "Rejected") {
    console.log("If rejected")
    Swal.fire({
      // title: 'question',
      text: 'The selected invoice has been rejected, so printing is not possible.',
      icon: 'info',
      // showCancelButton: true,
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.invoiceItem = invoice
        console.log("this.invoiceItem", this.invoiceItem)
      } else {
        this.invoiceItem = invoice
        console.log("this.invoiceItem", this.invoiceItem)
      }
    });
  } else if (this.invoiceItem.status == "Pending") {
    console.log("If pending")
    Swal.fire({
      // title: 'question',
      text: 'The invoice is pending, so please proceed with the process.',
      icon: 'info',
      showCancelButton: false,
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
      } else {
        this.invoiceItem = invoice
        console.log("this.invoiceItem", this.invoiceItem)
      }
    });
  }
  else if (this.invoiceItem.status == "Rejected_Reversed") {
    console.log("If pending")
    Swal.fire({
      // title: 'question',
      text: 'The selected invoice is Rejected Reversed, so please proceed with the process.',
      icon: 'info',
      showCancelButton: false,
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
      } else {
        this.invoiceItem = invoice
        console.log("this.invoiceItem", this.invoiceItem)
      }
    });
  }
  else {
     if(this.invoiceItem.status == "Amount Received") {
          Swal.fire({
            text: 'The selected invoice Amount  has been Received. Do you want to print the invoice?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Print',
          }).then((result) => {
            if (result.isConfirmed) {
              if (result.isConfirmed) {
                console.log('invoiceItem.proformaCardHeaderId',invoiceItem.proformaCardHeaderId)
                // Check conditions before calling print functions
                if (invoiceItem.proformaCardHeaderId === "PQ") {
                  this.generateInvoiceHTMLProfoma1(invoiceItem);
                  // Additional checks if needed
                }else if (invoiceItem.proformaCardHeaderId === "TAX") {
                  this.generateInvoiceHTMLTax4(invoiceItem);
                } else {
                  Swal.fire({
                    text: "No valid invoice type selected for printing.",
                    icon: "warning",
                  });
                }
              }
    
            }
          });
        }else{
          Swal.fire({
            text: 'The selected invoice has been approved. Do you want to print the invoice?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Print',
          }).then((result) => {
            if (result.isConfirmed) {
              console.log('invoiceItem.proformaCardHeaderId',invoiceItem.proformaCardHeaderId)
              // Check conditions before calling print functions
              if (invoiceItem.proformaCardHeaderId === "PQ") {
                this.generateInvoiceHTMLProfoma1(invoiceItem);
                // Additional checks if needed
              }else if (invoiceItem.proformaCardHeaderId === "TAX") {
                this.generateInvoiceHTMLTax4(invoiceItem);
              } else {
                Swal.fire({
                  text: "No valid invoice type selected for printing.",
                  icon: "warning",
                });
              }
            }
          });
          
        }
    
  }
}
generateInvoiceHTMLProfoma1(invoiceItem: InvoiceItem) {
 
  this.logoUrl = this.imageService.getBase64FlightLogo();
  this.InvoiceLogo = this.imageService.getBase64WorldLogo();
  this.signature = this.imageService.getBase64Signature();
  const invoiceHTML = `

<html>
<head>

<style>
    .invoice-container {
margin: 10px;
padding: 20px;
border: 1px solid #ccc;
background: #fff;
font-family: Arial, sans-serif;
}
 body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 5px;
            background-color: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 12px;
          }
     
        .invoice-container {
          width: 100%;
          margin: auto;
          border: 1px solid #ddd;
          padding: 10px;
          background: #fff;
          box-sizing: border-box;
      }

      .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
      }
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distributes space evenly */
}

.header-section .logo {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content vertically */
}

.header-section .left-logo {
  text-align: left; /* Align text to the left */
}

.header-section .right-logo {
  text-align: right; /* Align text to the right */
}

.header-section .company-name {
  text-align: center; /* Center the company name */
  flex-grow: 1; /* Allow the company name to take up available space */
}

.header-section img {
  max-width: 100px; /* Adjust as needed */
  height: auto;
}
 .booking-details {
    border: 1px solid #ccc;
    width: 100%;
  }

  .booking-header {
    background-color: rgb(91, 85, 130);
    padding: 5px;
    color:white;
      text-align: center;
    border-bottom: 1px solid #ccc;
  }

  .booking-data {
        padding: 5px;
  width: 100%;
  display: flex;
  font-size: 14px;
  }

  .data-item {
    display: inline-block;
    padding-right: 10px;
    border-right: 1px solid #ccc;
  }

  .data-item:last-child {
    border-right: none;
    padding-right: 0;
  }
   .text-center{
     text-align: right;
    }
  .orange-background {
 
background-color: rgb(167, 166, 175);
    font-size: 15px;
    color:white;
    padding: 8px;
    text-align: center;
    font-weight: bold;
  }
  .table-bordered {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 10px;
    // background-color:rgb(193, 205, 217); /* Added background color */
  }
   .table-bordered th {
      border: 1px solid white;
  padding: 2px;
  background: rgb(88 98 145) !important;
  color: white;
  }

  .table-bordered td {
  padding: 2px;
  }
  .booking-header bold{
  background-color: rgb(91, 85, 130);
  color: white;
  }
 

 
     
  .bold {
    font-weight: bold;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
 .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-top: 10px;
      }

      .footer .logo {
          width: 50%;
      }

      .footer .logo img {
          width: 100%;
          height: auto;
      }
   




@media print {
  .invoice-container {
margin: 5px;
padding: 5px;
border: 1px solid #ccc;
background: #fff;
font-family: Arial, sans-serif;
}
 body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 5px;
            background-color: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 12px;
          }
            .InvoiceHeader {
  background-color: rgb(181, 179, 200);
    font-size: 15px;
    color:white;
    padding: 8px;
    text-align: center;
    font-weight: bold;
  }
     
        .invoice-container {
          width: 100%;
          margin: auto;
          border: 1px solid #ddd;
          padding: 10px;
          background: #fff;
          box-sizing: border-box;
      }

      .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
      }
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distributes space evenly */
}

.header-section .logo {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content vertically */
}

.header-section .left-logo {
  text-align: left; /* Align text to the left */
}

.header-section .right-logo {
  text-align: right; /* Align text to the right */
}

.header-section .company-name {
  text-align: center; /* Center the company name */
  flex-grow: 1; /* Allow the company name to take up available space */
}

.header-section img {
  max-width: 100px; /* Adjust as needed */
  height: auto;
}
 .booking-details {
    border: 1px solid #ccc;
    width: 100%;
  }

  .booking-header {
    background-color: rgb(88, 98, 145);
    padding: 5px;
    color:white;
      text-align: center;
    border-bottom: 1px solid #ccc;
  }

  .booking-data {
        padding: 5px;
  width: 100%;
  display: flex;
  font-size: 14px;
  }

  .data-item {
    display: inline-block;
    padding-right: 10px;
    border-right: 1px solid #ccc;
  }

  .data-item:last-child {
    border-right: none;
    padding-right: 0;
  }
   .text-center{
     text-align: right;
    }
  .orange-background {
 
   background-color: rgb(127, 127, 136);
    font-size: 15px;
    color:white;
    padding: 8px;
    text-align: center;
    font-weight: bold;
  }
  .table-bordered {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 10px;
    // background-color:rgb(193, 205, 217); /* Added background color */
  }
   .table-bordered th {
      border: 1px solid white;
  padding: 2px;
   background-color: rgb(91, 85, 130);
  color: white;
  }

  .table-bordered td {
  padding: 2px;
  }
  .booking-header bold{
  background-color: rgb(88, 98, 145);
  color: white;
  }
 

 
     
  .bold {
    font-weight: bold;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
 .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-top: 10px;
      }

      .footer .logo {
          width: 50%;
      }

      .footer .logo img {
          width: 100%;
          height: auto;
      }


</style>
</head>
<body>
<div class="invoice-container">
  <div class="header-section">
         <div class="logo left-logo"><img src="${this.logoUrl}" alt="Invoice Logo"></div>
    <div class="logo"><h3>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h3></div>
          <div class="logo right-logo"><img src="${this.InvoiceLogo}" alt="Company Logo"></div>
  </div>
  <div class="InvoiceHeader">${invoiceItem.proformaCardHeaderName}</div>
  <br>
 
  <table class="table-bordered">
    <tr>
      <th class="bold">TO</th>
      <th class="bold">FROM</th>
    </tr>
    <tr>
      <td>${invoiceItem.header.ProformaCustomerName}<br>${invoiceItem.header.ProformaAddress}<br>${invoiceItem.header.ProformaCity}<br>${invoiceItem.header.ProformaPincode} <br><strong>GST NO:</strong>${invoiceItem.header.ProformaGstNo}<br>
              <strong>PAN NO:</strong> ${invoiceItem.header.ProformaPan}</td>
      <td><strong>INVOICE NO:</strong> ${invoiceItem.invoiceUniqueNumber}<br><strong>DATE: </strong>${invoiceItem.header.ProformaInvoiceDate}<br><strong>PAN NO</strong>:${invoiceItem.header.ProformaPanNO}<br><strong>GST NO: </strong>${invoiceItem.header.ProformaGstNumber}<br><strong>Type of Aircraft</strong>:${invoiceItem.header.ProformaTypeOfAircraft}<br><strong>Seating Capasity</strong>:${invoiceItem.header.ProformaSeatingCapasity}</td>
    </tr>
  </table>

  <div class="booking-details">
<div class="booking-header bold">BOOKING  DETAILS</div>
<div class="booking-data single-line">
    <div style="width:35%; text-align: center;" ><div class="bold">Date Of Journey</div> <div>03/03/25-04/03/2025</div></div>
    <div style="width:35%; text-align: center;" ><div class="bold">Sector</div> <div>${invoiceItem.header.BookingSector}</div></div>
    <div style="width:30%; text-align: center;" ><div class="bold">Billing Flying Time</div> <div>${invoiceItem.header.BookingBillingFlyingTime}</div></div>
</div>
</div>

  <table class="table-bordered">
            <thead>
              <tr>
                <th class="booking-header bold">S.NO</th>
                <th class="booking-header bold">DESCRIPATION</th>
                <th class="booking-header bold">UNITS (Hrs.)</th>
                <th class="booking-header bold">RATE(INR)</th>
                <th class="booking-header bold">AMOUNT(INR)</th>
              </tr>
            </thead>
            <tbody>
           <tr>
            <td>1</td>
            <td class="bold">CHARGES</td>
            <td class="text-right"></td>
            <td class="text-right"></td>
            <td></td>
          </tr>
              ${invoiceItem.chargesList.map((charge, index) => `
                <tr>
                 
                   <td class="text-center"></td>
                  <td>${charge.description}</td>
                  <td class="text-center">${charge.units ? charge.units : ''}</td>
                  <td class="text-right">${charge.rate}</td>
                  <td class="text-right">${charge.amount}</td>
                </tr>
              `).join('')}
             
              <tr>
              <td></td>
              <td></td>
              <td></td>
                <td  class="text-right bold" style="background-color: rgb(181, 179, 200);">TOTAL</td>
                <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">${invoiceItem.subtotal}</td>
              </tr>
              <tr>
            <td>2</td>
                  <td class="bold">TAXES:</td>
                  <td></td>
                  <td></td>
                  <td></td>
            </tr>

              ${invoiceItem.taxList.map(tax => `
                <tr>
                  <td></td>
                  <td>${tax.description}</td>
                  <td></td>
                  <td></td>
                  <td class="text-right">${tax.amount}</td>
                </tr>
              `).join('')}

              <tr>
              <td></td>
              <td></td>
              <td></td>
                <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">GRAND TOTAL</td>
                <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">${invoiceItem.grandTotal ? invoiceItem.grandTotal.toFixed(2) : '0.00'}</td>
              </tr>
               <tr>
                  <td colspan="5" class="bold"> ${invoiceItem.amountInWords}</td>
               </tr>
            </tbody>
          </table>
 
  <table class="table-bordered">
    <tr>
     
      <th class="booking-header bold">BANK DETAILS</th>
   
    </tr>
    <tr>
      <td><strong>Account Name:</strong> RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED<br><strong>Bank:</strong> KOTAK MAHINDRA BANK<br><strong>Account No:</strong> 0745211990<br><strong>Branch:</strong> BANJARAHILLS<br><strong>IFSC Code:</strong> KKBK00007461 (NEFT/RTGS)</td>
     
    </tr>
  </table>
 

  <div class="footer">
          <div class="logo"> <p class="bold">Note:</p>
  <p>${invoiceItem.header.notes}</p>
  </div>
          <div class="text-center">
                <div><h4>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h4></div>

              <div  > <img src="${this.signature}" alt="Company Logo" class="logo"></div>
                 Authorised Signatory
             
          </div>
      </div>
 
</div>
</body>
</html>


  `;

  const newWindow = window.open('', '', 'height=600,width=800');
  if (newWindow) {
    newWindow.document.write(invoiceHTML);
    newWindow.document.close();

    setTimeout(() => {
      newWindow.print();
    }, 500);
  }
};
generateInvoiceHTMLProfoma2(invoiceItem: InvoiceItem) {

  this.logoUrl = this.imageService.getBase64FlightLogo();
  this.InvoiceLogo = this.imageService.getBase64WorldLogo();
  this.signature = this.imageService.getBase64Signature();
  const invoiceHTML = `
 
<html>
<head>

<style>
    .invoice-container {
margin: 10px;
padding: 20px;
border: 1px solid #ccc;
background: #fff;
font-family: Arial, sans-serif;
}
 body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 5px;
            background-color: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 12px;
          }
     
        .invoice-container {
          width: 100%;
          margin: auto;
          border: 1px solid #ddd;
          padding: 10px;
          background: #fff;
          box-sizing: border-box;
      }

      .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
      }
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distributes space evenly */
}

.header-section .logo {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content vertically */
}

.header-section .left-logo {
  text-align: left; /* Align text to the left */
}

.header-section .right-logo {
  text-align: right; /* Align text to the right */
}

.header-section .company-name {
  text-align: center; /* Center the company name */
  flex-grow: 1; /* Allow the company name to take up available space */
}

.header-section img {
  max-width: 100px; /* Adjust as needed */
  height: auto;
}
 .booking-details {
    border: 1px solid #ccc;
    width: 100%;
  }

  .booking-header {
    background-color: rgb(91, 85, 130);
    padding: 5px;
    color:white;
      text-align: center;
    border-bottom: 1px solid #ccc;
  }

  .booking-data {
        padding: 5px;
  width: 100%;
  display: flex;
  font-size: 14px;
  }

  .data-item {
    display: inline-block;
    padding-right: 10px;
    border-right: 1px solid #ccc;
  }

  .data-item:last-child {
    border-right: none;
    padding-right: 0;
  }
   .text-center{
     text-align: right;
    }
  .orange-background {
 
background-color: rgb(167, 166, 175);
    font-size: 15px;
    color:white;
    padding: 8px;
    text-align: center;
    font-weight: bold;
  }
  .table-bordered {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 10px;
    // background-color:rgb(193, 205, 217); /* Added background color */
  }
   .table-bordered th {
      border: 1px solid white;
  padding: 2px;
  background: rgb(88 98 145) !important;
  color: white;
  }

  .table-bordered td {
  padding: 2px;
  }
  .booking-header bold{
  background-color: rgb(91, 85, 130);
  color: white;
  }
 

 
     
  .bold {
    font-weight: bold;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
 .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-top: 10px;
      }

      .footer .logo {
          width: 50%;
      }

      .footer .logo img {
          width: 100%;
          height: auto;
      }
   




@media print {
  .invoice-container {
margin: 5px;
padding: 5px;
border: 1px solid #ccc;
background: #fff;
font-family: Arial, sans-serif;
}
 body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 5px;
            background-color: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 12px;
          }
            .InvoiceHeader {
  background-color: rgb(181, 179, 200);
    font-size: 15px;
    color:white;
    padding: 8px;
    text-align: center;
    font-weight: bold;
  }
     
        .invoice-container {
          width: 100%;
          margin: auto;
          border: 1px solid #ddd;
          padding: 10px;
          background: #fff;
          box-sizing: border-box;
      }

      .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
      }
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distributes space evenly */
}

.header-section .logo {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content vertically */
}

.header-section .left-logo {
  text-align: left; /* Align text to the left */
}

.header-section .right-logo {
  text-align: right; /* Align text to the right */
}

.header-section .company-name {
  text-align: center; /* Center the company name */
  flex-grow: 1; /* Allow the company name to take up available space */
}

.header-section img {
  max-width: 100px; /* Adjust as needed */
  height: auto;
}
 .booking-details {
    border: 1px solid #ccc;
    width: 100%;
  }

  .booking-header {
    background-color: rgb(88, 98, 145);
    padding: 5px;
    color:white;
      text-align: center;
    border-bottom: 1px solid #ccc;
  }

  .booking-data {
        padding: 5px;
  width: 100%;
  display: flex;
  font-size: 14px;
  }

  .data-item {
    display: inline-block;
    padding-right: 10px;
    border-right: 1px solid #ccc;
  }

  .data-item:last-child {
    border-right: none;
    padding-right: 0;
  }
   .text-center{
     text-align: right;
    }
  .orange-background {
 
   background-color: rgb(127, 127, 136);
    font-size: 15px;
    color:white;
    padding: 8px;
    text-align: center;
    font-weight: bold;
  }
  .table-bordered {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 10px;
    // background-color:rgb(193, 205, 217); /* Added background color */
  }
   .table-bordered th {
      border: 1px solid white;
  padding: 2px;
   background-color: rgb(91, 85, 130);
  color: white;
  }

  .table-bordered td {
  padding: 2px;
  }
  .booking-header bold{
  background-color: rgb(88, 98, 145);
  color: white;
  }
 

 
     
  .bold {
    font-weight: bold;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
 .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-top: 10px;
      }

      .footer .logo {
          width: 50%;
      }

      .footer .logo img {
          width: 100%;
          height: auto;
      }


</style>
</head>
<body>
<div class="invoice-container">
  <div class="header-section">
              <div class="logo right-logo"><img src="${this.InvoiceLogo}" alt="Company Logo"></div>
    <div class="logo"><h3>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h3></div>
               <div class="logo left-logo"><img src="${this.logoUrl}" alt="Invoice Logo"></div>

  </div>
  <div class="InvoiceHeader">${invoiceItem.proformaCardHeaderName}</div>
  <br>
 
  <table class="table-bordered">
    <tr>
      <th class="bold">TO</th>
      <th class="bold">FROM</th>
    </tr>
    <tr>
      <td>${invoiceItem.header.ProformaCustomerName}<br>${invoiceItem.header.ProformaAddress}<br>${invoiceItem.header.ProformaCity}<br>${invoiceItem.header.ProformaPincode} <br><strong>GST NO:</strong>${invoiceItem.header.ProformaGstNo}<br>
              <strong>PAN NO:</strong> ${invoiceItem.header.ProformaPan}</td>
      <td><strong>INVOICE NO:</strong> ${invoiceItem.invoiceUniqueNumber}<br><strong>DATE: </strong>${invoiceItem.header.ProformaInvoiceDate}<br><strong>PAN NO</strong>:${invoiceItem.header.ProformaPanNO}<br><strong>GST NO: </strong>${invoiceItem.header.ProformaGstNumber}<br><strong>Type of Aircraft</strong>:${invoiceItem.header.ProformaTypeOfAircraft}<br><strong>Seating Capasity</strong>:${invoiceItem.header.ProformaSeatingCapasity}</td>
    </tr>
  </table>

  <div class="booking-details">
<div class="booking-header bold">BOOKING  DETAILS</div>
<div class="booking-data single-line">
    <div style="width:35%; text-align: center;" ><div class="bold">Date Of Journey</div> <div>03/03/25-04/03/2025</div></div>
    <div style="width:35%; text-align: center;" ><div class="bold">Sector</div> <div>${invoiceItem.header.BookingSector}</div></div>
    <div style="width:30%; text-align: center;" ><div class="bold">Billing Flying Time</div> <div>${invoiceItem.header.BookingBillingFlyingTime}</div></div>
</div>
</div>

  <table class="table-bordered">
            <thead>
              <tr>
                <th class="booking-header bold">S.NO</th>
                <th class="booking-header bold">DESCRIPATION</th>
                <th class="booking-header bold">UNITS (Hrs.)</th>
                <th class="booking-header bold">RATE(INR)</th>
                <th class="booking-header bold">AMOUNT(INR)</th>
              </tr>
            </thead>
            <tbody>
           <tr>
            <td>1</td>
            <td class="bold">CHARGES</td>
            <td class="text-right"></td>
            <td class="text-right"></td>
            <td></td>
          </tr>
              ${invoiceItem.chargesList.map((charge, index) => `
                <tr>
                 
                   <td class="text-center"></td>
                  <td>${charge.description}</td>
                  <td class="text-center">${charge.units ? charge.units : ''}</td>
                  <td class="text-right">${charge.rate}</td>
                  <td class="text-right">${charge.amount}</td>
                </tr>
              `).join('')}
             
              <tr>
              <td></td>
              <td></td>
              <td></td>
                <td  class="text-right bold" style="background-color: rgb(181, 179, 200);">TOTAL</td>
                <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">${invoiceItem.subtotal}</td>
              </tr>
              <tr>
            <td>2</td>
                  <td class="bold">TAXES:</td>
                  <td></td>
                  <td></td>
                  <td></td>
            </tr>

              ${invoiceItem.taxList.map(tax => `
                <tr>
                  <td></td>
                  <td>${tax.description}</td>
                  <td></td>
                  <td></td>
                  <td class="text-right">${tax.amount}</td>
                </tr>
              `).join('')}

              <tr>
              <td></td>
              <td></td>
              <td></td>
                <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">GRAND TOTAL</td>
                <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">${invoiceItem.grandTotal ? invoiceItem.grandTotal.toFixed(2) : '0.00'}</td>
              </tr>
               <tr>
                  <td colspan="5" class="bold"> ${invoiceItem.amountInWords}</td>
               </tr>
            </tbody>
          </table>
 
  <table class="table-bordered">
    <tr>
     
      <th class="booking-header bold">BANK DETAILS</th>
   
    </tr>
    <tr>
      <td><strong>Account Name:</strong> RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED<br><strong>Bank:</strong> KOTAK MAHINDRA BANK<br><strong>Account No:</strong> 0745211990<br><strong>Branch:</strong> BANJARAHILLS<br><strong>IFSC Code:</strong> KKBK00007461 (NEFT/RTGS)</td>
     
    </tr>
  </table>
 

  <div class="footer">
          <div class="logo"> <p class="bold">Note:</p>
  <p>${invoiceItem.header.notes}</p>
  </div>
          <div class="text-center">
                <div><h4>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h4></div>

              <div  > <img src="${this.signature}" alt="Company Logo" class="logo"></div>
                 Authorised Signatory
             
          </div>
      </div>
 
</div>
</body>
</html>


  `;

  const newWindow = window.open('', '', 'height=600,width=800');
  if (newWindow) {
    newWindow.document.write(invoiceHTML);
    newWindow.document.close();

    setTimeout(() => {
      newWindow.print();
    }, 500);
  }
};

  // openInvoicePopup(invoice) {
  //   console.log('item', invoice)
  //   const invoiceItem = invoice;

  // }
  // InvoicePrint(){
  //   const printContents = this.invoiceContent.nativeElement.innerHTML;
  //   const originalContents = document.body.innerHTML;

  //   document.body.innerHTML = printContents;
  //   window.print();
  //   document.body.innerHTML = originalContents;
  //   window.location.reload(); // Refresh to restore original state
  // }

  // generateInvoiceHTML() {
  //   const invoiceHTML = `
  //     <html>
  //       <head>
  //         <title>Proforma Invoice</title>
  //         <style>
  //           /* General styles */
  //           body {
  //             font-family: Arial, sans-serif;
  //             margin: 0;
  //             padding: 0;
  //             background-color: white;
  //           }
  //           .container {
  //             width: 100%;
  //             padding: 20px;
  //           }
  //           .yellow-background {
  //             background-color: yellow !important;
  //             padding: 10px !important;
  //             color: white !important;
  //             border-radius: 0px !important;
  //           }
  //           .card-header {
  //             background-color: yellow !important;
  //             color: white;
  //           }
  //           .booking-title {
  //             background-color: yellow !important;
  //             color: white;
  //           }
  //           .table-bordered {
  //             border: 2px solid black !important;
  //             width: 100%;
  //           }

  //           /* Print-specific styles */
  //           @media print {
  //             body {
  //               background-color: white;
  //             }
  //             .yellow-background {
  //              background-color: rgb(63, 63, 185) !important;
  //               color: white !important;
  //             }
  //             .table-bordered {
  //               border: 1px solid black !important;
  //             }
  //             .card-header, .booking-title {
  //             background-color: rgb(63, 63, 185) !important;
  //               color: white !important;
  //             }

  //              .table thead th{
  //                vertical-align: middle !important;
  //                padding: 5px !important;
  //                border-bottom: 0px solid #a9a9a9;
  //               background-color: rgb(63, 63, 185) !important;
  //               color: white;
  //               font-weight: 500;
  //               text-align: center !important;
  //               font-size: 12px !important;
  //             }
  //             .table td, .table th {
  //              padding: 10px !important;
  //              vertical-align: top;
  //              border-top: 1px solid #dee2e6;
  //             }
  //             .table{
  //                font-size: 12px !important;
  //                 font-weight: 500 !important;
  //               }
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="border">
  //           <div style="display: flex; align-items: flex-start; flex-wrap: wrap; justify-content: space-evenly;">
  //             <div><img src="assets/images/logo.jpg" alt="Company Logo" class="img-fluid" style="height: 50px;"></div>
  //             <div>
  //               <h3 class="company-name">RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h3>
  //               <img src="assets/images/logo.jpg" alt="Company Logo" class="img-fluid" style="height: 50px;">
  //             </div>
  //              <div><img src="assets/images/logo.jpg" alt="Company Logo" class="img-fluid" style="height: 50px;"></div>
  //           </div>

  //           <div style="margin-bottom: 24px;">
  //             <div class="yellow-background">
  //               PROFORMA INVOICE
  //             </div>
  //             <div style="padding: 10px;">
  //               <table class="table table-bordered">
  //                 <tr><td>To:</td><td> INVOICE NO  RGPAPL/PI-803/12-2024</td></tr>
  //                 <tr><td>MYTHRI MOVIE MAKERS</td><td> DATE 29-12-2024</td></tr>
  //                 <tr><td>ROAD NO.25,HYDERABAD</td><td>PAN   AAICS 9057Q</td></tr>
  //                 <tr><td>TELANGANA-500033</td><td>GST NO   36AAICS9057Q1Z2D</td></tr>
  //                 <tr><td>GST NO. 36AAWFM8714H1ZO</td><td>TYPE OF Aircraft B-250 GT (VT-VIN)</td></tr>
  //                 <tr><td>PAN NO.AAWFM8714H</td><td>SEATING CAPACITY  7</td></tr>
  //               </table>
  //             </div>
  //           </div>

  //           <div class="card-header text-center">
  //             BOOKING DETAILS
  //           </div>
  //           <div class="card-body">
  //             <table class="table table-bordered">
  //               <tr><td>Date Of Journey</td><td>29-Dec-2024</td></tr>
  //               <tr><td>SECTOR</td><td>HYDERABAD-CHENNAI-HYDERABAD</td></tr>
  //               <tr><td>BILLING FLYING TIME</td><td>03:30 Hrs.</td></tr>
  //             </table>

  //             <table class="table table-bordered text-center align-middle">
  //               <thead style="background-color: #f4f4f4; font-weight: bold;">
  //                 <tr>
  //                   <th>S.No</th>
  //                   <th>Description</th>
  //                   <th>Units (Hrs.)</th>
  //                   <th>Rate (INR)</th>
  //                   <th>Amount (INR)</th>
  //                 </tr>
  //               </thead>
  //               <tbody>
  //                 <tr>
  //                   <td>1</td>
  //                   <td>Hyderabad-Chennai-Hyderabad</td>
  //                   <td>03:30</td>
  //                   <td>1,50,000</td>
  //                   <td>5,25,000</td>
  //                 </tr>
  //                 <tr>
  //                   <td>2</td>
  //                   <td>Ground Handling Charges</td>
  //                   <td>-</td>
  //                   <td>1,20,000</td>
  //                   <td>1,20,000</td>
  //                 </tr>
  //                 <tr>
  //                   <td colspan="4"><strong>Total</strong></td>
  //                   <td><strong>6,45,000</strong></td>
  //                 </tr>
  //                 <tr>
  //                   <td colspan="4">CGST 9% + SGST 9%</td>
  //                   <td>1,16,100</td>
  //                 </tr>
  //                 <tr>
  //                   <td colspan="4"><strong>Grand Total</strong></td>
  //                   <td><strong>7,61,100</strong></td>
  //                 </tr>
  //               </tbody>
  //             </table>
  //           </div>

  //           <div class="border mb-4">
  //             <h5 class="text-center booking-title">BANK DETAILS</h5>
  //             <div class="row">
  //               <div class="col-md-6">
  //                 <p><strong>Note:</strong> 1. In case of any discrepancy contact accounts within 5 days of receiving the bill</p>
  //                 <p>2. Payment to be made within 2 days after receiving the invoice</p>
  //                 <p>3. In case of Payments delayed beyond 30 days, an 18% penal Interest per Annum will apply</p>
  //               </div>
  //             </div>

  //             <div class="text-center mt-4">
  //               <p class="footer-text">RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</p>
  //               <p>Authorised Signatory</p>
  //               <div class="row">
  //                 <div class="col-md-6">
  //                   <table>
  //                     <tr><td>ACCOUNT NAME:</td><td>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</td></tr>
  //                     <tr><td>BANK:</td><td>KOTAK MAHINDRA BANK</td></tr>
  //                     <tr><td>ACCOUNT NO:</td><td>0745211990</td></tr>
  //                     <tr><td>BRANCH:</td><td>BANJARAHILLS</td></tr>
  //                     <tr><td>IFSC CODE:</td><td>KKBK00007461(NEFT/RTGS)</td></tr>
  //                   </table>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </body>
  //     </html>
  //   `;

  //   const newWindow = window.open('', '', 'height=600,width=800');
  //   newWindow.document.write(invoiceHTML);
  //   newWindow.document.close();

  //   // Wait for the content to load before triggering print
  //   setTimeout(() => {
  //     newWindow.print();
  //   }, 1000); // Delay the print for 1 second
  // }



  // generateInvoiceHTML (){
  //   const invoiceHTML = `
  //     <html>
  //       <head>
  //         <title>Proforma Invoice</title>
  //         <style>
  //           /* General styles */
  //           body {
  //             font-family: Arial, sans-serif;
  //             margin: 0;
  //             padding: 10px;
  //             background-color: white;
  //             -webkit-print-color-adjust: exact !important;
  //             print-color-adjust: exact !important;
  //           }
  //           .container {
  //             width: 100%;
  //             max-width: 1000px;
  //             margin: 0 auto;
  //           }
  //           .yellow-background {
  //             background-color: yellow;
  //             padding: 10px;
  //             color: black;
  //             font-weight: bold;
  //             text-align: center;
  //             margin-bottom: 15px;
  //           }
  //           .card-header {
  //             background-color: yellow;
  //             color: black;
  //             padding: 10px;
  //             text-align: center;
  //             font-weight: bold;
  //             margin: 15px 0;
  //           }
  //           .booking-title {
  //             background-color: yellow;
  //             color: black;
  //             padding: 10px;
  //             text-align: center;
  //             margin: 15px 0;
  //           }
  //           .table-bordered {
  //             border-collapse: collapse;
  //             width: 100%;
  //             margin-bottom: 15px;
  //           }
  //           .table-bordered td,
  //           .table-bordered th {
  //             border: 1px solid black;
  //             padding: 8px;
  //           }
  //           .border {
  //             border: 1px solid black;
  //             padding: 5px;
  //           }
  //           .text-center {
  //             text-align: center;
  //           }
  //           .mb-4 {
  //             margin-bottom: 1.5rem;
  //           }
  //           .mt-4 {
  //             margin-top: 1.5rem;
  //           }
  //           .company-name {
  //             text-align: center;
  //             margin: 10px 0;
  //           }
  //           .footer-text {
  //             font-weight: bold;
  //             margin-bottom: 5px;
  //           }

  //           /* Print-specific styles */
  //           @media print {
  //             body {
  //               -webkit-print-color-adjust: exact !important;
  //               print-color-adjust: exact !important;
  //             }
  //             .yellow-background,
  //             .card-header,
  //             .booking-title {
  //               background-color: yellow ;
  //               color: white !important;
  //               -webkit-print-color-adjust: exact !important;
  //               print-color-adjust: exact !important;
  //             }
  //             .table thead th {
  //               background-color: rgb(63, 63, 185) !important;
  //               color: white !important;
  //               vertical-align: middle !important;
  //               padding: 5px !important;
  //               font-weight: 500;
  //               text-align: center !important;
  //               font-size: 12px !important;
  //               -webkit-print-color-adjust: exact !important;
  //               print-color-adjust: exact !important;
  //             }
  //             .table {
  //               font-size: 12px !important;
  //               font-weight: 500 !important;
  //             }
  //             .table td,
  //             .table th {
  //               padding: 10px !important;
  //               vertical-align: top;
  //               border: 1px solid black !important;
  //             }
  //             img {
  //               -webkit-print-color-adjust: exact !important;
  //               print-color-adjust: exact !important;
  //             }
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="border">
  //           <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
  //             <div><img src="assets/images/logo.jpg" alt="Company Logo" style="height: 50px;"></div>
  //             <div style="text-align: center;">
  //               <h3 class="company-name">RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h3>
  //             </div>
  //             <div><img src="assets/images/logo.jpg" alt="Company Logo" style="height: 50px;"></div>
  //           </div>

  //           <div class="yellow-background">
  //             PROFORMA INVOICE
  //           </div>

  //           <table class="table-bordered">
  //             <tr><td width="50%">To:</td><td>INVOICE NO  RGPAPL/PI-803/12-2024</td></tr>
  //             <tr><td>MYTHRI MOVIE MAKERS</td><td>DATE 29-12-2024</td></tr>
  //             <tr><td>ROAD NO.25,HYDERABAD</td><td>PAN   AAICS 9057Q</td></tr>
  //             <tr><td>TELANGANA-500033</td><td>GST NO   36AAICS9057Q1Z2D</td></tr>
  //             <tr><td>GST NO. 36AAWFM8714H1ZO</td><td>TYPE OF Aircraft B-250 GT (VT-VIN)</td></tr>
  //             <tr><td>PAN NO.AAWFM8714H</td><td>SEATING CAPACITY  7</td></tr>
  //           </table>

  //           <div class="card-header">
  //             BOOKING DETAILS
  //           </div>

  //           <table class="table-bordered">
  //             <tr><td width="50%">Date Of Journey</td><td>29-Dec-2024</td></tr>
  //             <tr><td>SECTOR</td><td>HYDERABAD-CHENNAI-HYDERABAD</td></tr>
  //             <tr><td>BILLING FLYING TIME</td><td>03:30 Hrs.</td></tr>
  //           </table>

  //           <table class="table-bordered">
  //             <thead>
  //               <tr style="background-color: yellow;">
  //                 <th>S.No</th>
  //                 <th>Description</th>
  //                 <th>Units (Hrs.)</th>
  //                 <th>Rate (INR)</th>
  //                 <th>Amount (INR)</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               <tr>
  //                 <td class="text-center">1</td>
  //                 <td>Hyderabad-Chennai-Hyderabad</td>
  //                 <td class="text-center">03:30</td>
  //                 <td class="text-center">1,50,000</td>
  //                 <td class="text-center">5,25,000</td>
  //               </tr>
  //               <tr>
  //                 <td class="text-center">2</td>
  //                 <td>Ground Handling Charges</td>
  //                 <td class="text-center">-</td>
  //                 <td class="text-center">1,20,000</td>
  //                 <td class="text-center">1,20,000</td>
  //               </tr>
  //               <tr>
  //                 <td colspan="4" class="text-center"><strong>Total</strong></td>
  //                 <td class="text-center"><strong>6,45,000</strong></td>
  //               </tr>
  //               <tr>
  //                 <td colspan="4" class="text-center">CGST 9% + SGST 9%</td>
  //                 <td class="text-center">1,16,100</td>
  //               </tr>
  //               <tr>
  //                 <td colspan="4" class="text-center"><strong>Grand Total</strong></td>
  //                 <td class="text-center"><strong>7,61,100</strong></td>
  //               </tr>
  //             </tbody>
  //           </table>

  //           <div class="border mb-4">
  //             <h5 class="booking-title">BANK DETAILS</h5>
  //             <div style="padding: 15px;">
  //               <p><strong>Note:</strong></p>
  //               <p>1. In case of any discrepancy contact accounts within 5 days of receiving the bill</p>
  //               <p>2. Payment to be made within 2 days after receiving the invoice</p>
  //               <p>3. In case of Payments delayed beyond 30 days, an 18% penal Interest per Annum will apply</p>

  //               <div class="text-center mt-4">
  //                 <p class="footer-text">RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</p>
  //                 <p>Authorised Signatory</p>

  //                 <table class="table-bordered" style="margin-top: 20px;">
  //                   <tr><td width="30%">ACCOUNT NAME:</td><td>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</td></tr>
  //                   <tr><td>BANK:</td><td>KOTAK MAHINDRA BANK</td></tr>
  //                   <tr><td>ACCOUNT NO:</td><td>0745211990</td></tr>
  //                   <tr><td>BRANCH:</td><td>BANJARAHILLS</td></tr>
  //                   <tr><td>IFSC CODE:</td><td>KKBK00007461(NEFT/RTGS)</td></tr>
  //                 </table>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </body>
  //     </html>
  //   `;

  //   const newWindow = window.open('', '', 'height=600,width=800');
  //   if (newWindow) {
  //     newWindow.document.write(invoiceHTML);
  //     newWindow.document.close();

  //     // Wait for the content to load before triggering print
  //     setTimeout(() => {
  //       newWindow.print();
  //       // Don't close the window immediately after print to allow the print dialog to work properly
  //     }, 500);
  //   }
  // };


  generateInvoiceHTML(invoiceItem: InvoiceItem) {

    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();
    const invoiceHTML = `
      <html>
        <head>
          <title>Proforma Invoice</title>
          <style>
            /* General styles */
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 5px;
              background-color: white;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-size: 12px;
            }
            .container {
              width: 100%;
              max-width: 1000px;
              margin: 0 auto;
            }
            .orange-background {
              background-color: rgb(255, 165, 0) !important;
              padding: 8px;
              color: black !important;
              font-weight: bold;
              text-align: center;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .card-header {
              background-color: rgb(255, 165, 0) !important;
              color: black !important;
              padding: 8px;
              text-align: center;
              font-weight: bold;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .booking-title {
              background-color: rgb(255, 165, 0) !important;
              color: black !important;
              padding: 8px;
              text-align: center;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .table-bordered {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 10px;
            }
            .table-bordered td,
            .table-bordered th {
              border: 1px solid black;
              padding: 5px;
            }
            .border {
              border: 1px solid black;
              padding: 5px;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .mb-4 {
              margin-bottom: 1rem;
            }
            .mt-4 {
              margin-top: 1rem;
            }
            .company-name {
              text-align: center;
              margin: 5px 0;
              font-size: 14px;
              font-weight: bold;
            }
            .footer-text {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .header-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .logo {
              height: 90px;
            }
            .notes {
              margin: 5px 0;
              font-size: 11px;
            }
            .bank-details {
              margin-top: 10px;
            }
            .bold {
              font-weight: bold;
            }
            
            /* Print-specific styles */
            @media print {
              body {
                margin: 0;
                padding: 5px;
              }
              .orange-background,
              .card-header,
              .booking-title {
                background-color: rgb(255, 165, 0) !important;
                color: black !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              thead tr {
                background-color: rgb(255, 165, 0) !important;
                color: black !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              thead th {
                background-color: rgb(255, 165, 0) !important;
                color: black !important;
                vertical-align: middle !important;
                padding: 5px !important;
                font-weight: bold;
                text-align: center !important;
                font-size: 12px !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="border">
            <div class="header-row">
            
              <div><img src="${this.logoUrl}" alt="Company Logo" class="logo"></div>
              <div>
                <img src="${this.InvoiceLogo}" alt="Company Logo" class="logo">
              </div>
              <div><img src="${this.logoUrl}" alt="Company Logo" class="logo"></div>
            </div>
            
            <div class="orange-background">
             Proforma Invoice
            </div>
            
            <table class="table-bordered">
              <tr><td width="50%">To:</td><td>INVOICE NO : ${invoiceItem.invoiceUniqueNumber}</td></tr>
              <tr><td>${invoiceItem.header.ProformaCustomerName}</td><td>DATE :${invoiceItem.header.ProformaInvoiceDate}</td></tr>
              <tr><td>${invoiceItem.header.ProformaAddress}</td><td>PAN :${invoiceItem.header.ProformaPanNO}</td></tr>
              <tr><td>${invoiceItem.header.ProformaCity}-${invoiceItem.header.ProformaPincode}</td><td>GST NO :${invoiceItem.header.ProformaGstNumber}</td></tr>
              <tr><td>GST NO : ${invoiceItem.header.ProformaGstNo}</td><td>TYPE OF Aircraft : ${invoiceItem.header.ProformaTypeOfAircraft}</td></tr>
              <tr><td>PAN NO :${invoiceItem.header.ProformaPan}</td><td>SEATING CAPACITY : ${invoiceItem.header.ProformaSeatingCapasity}</td></tr>
            </table>

            <div class="card-header">
              Booking Details
            </div>
            
            <table class="table-bordered">
              <tr><td width="50%">Date Of Journey</td><td>${invoiceItem.header.BookingDateOfJourny}</td></tr>
              <tr><td>SECTOR</td><td>${invoiceItem.header.BookingSector}</td></tr>
              <tr><td>BILLING FLYING TIME</td><td>${invoiceItem.header.BookingBillingFlyingTime} Hrs.</td></tr>
            </table>

            <table class="table-bordered">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Description</th>
                  <th>Units (Hrs.)</th>
                  <th>Rate (INR)</th>
                  <th>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
             <tr>
              <td>1</td>
              <td class="bold">Charges</td>
              <td class="text-right"></td>
              <td class="text-right"></td>
              <td></td>
            </tr>
                ${invoiceItem.chargesList.map((charge, index) => `
                  <tr>
                   
                     <td class="text-center"></td>
                    <td>${charge.description}</td>
                    <td class="text-center">${charge.units ? charge.units : ''}</td>
                    <td class="text-right">${charge.rate}</td>
                    <td class="text-right">${charge.amount}</td>
                  </tr>
                `).join('')}
                
                <tr>
                  <td colspan="4" class="text-right bold">Total</td>
                  <td class="text-right bold">${invoiceItem.subtotal}</td>
                </tr>
                <tr>
              <td>2</td>
                    <td class="bold">Taxes:</td>
                    <td></td>
                    <td></td>
                    <td></td>
              </tr>

                ${invoiceItem.taxList.map(tax => `
                  <tr>
                    <td></td>
                    <td>${tax.description}</td>
                    <td></td>
                    <td></td>
                    <td class="text-right">${tax.amount}</td>
                  </tr>
                `).join('')}

                <tr>
                  <td colspan="4" class="text-right bold">Grand Total</td>
                  <td class="text-right bold">${invoiceItem.grandTotal}</td>
                </tr>
              </tbody>
            </table>

            <div class="border">
            
            <div class="card-header">
              Bank Details
            </div>
              <div style="padding: 5px;">
                <div class="notes">
                  <p><strong>Note:</strong></p>
                  <p>${invoiceItem.header.notes}</p>
                  
                </div>
                  <div class="header-row">
                    <div>
                      <div style="display: flex; flex-wrap: wrap; margin-bottom: 5px;">
                        <div style="width: 30%; font-weight: bold;">ACCOUNT NAME:</div>
                        <div style="width: 70%;">RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</div>
                      </div>
                      <div style="display: flex; flex-wrap: wrap; margin-bottom: 5px;">
                        <div style="width: 30%; font-weight: bold;">BANK:</div>
                        <div style="width: 70%;">KOTAK MAHINDRA BANK</div>
                      </div>
                      <div style="display: flex; flex-wrap: wrap; margin-bottom: 5px;">
                        <div style="width: 30%; font-weight: bold;">ACCOUNT NO:</div>
                        <div style="width: 70%;">0745211990</div>
                      </div>
                      <div style="display: flex; flex-wrap: wrap; margin-bottom: 5px;">
                        <div style="width: 30%; font-weight: bold;">BRANCH:</div>
                        <div style="width: 70%;">BANJARAHILLS</div>
                      </div>
                      <div style="display: flex; flex-wrap: wrap; margin-bottom: 5px;">
                        <div style="width: 30%; font-weight: bold;">IFSC CODE:</div>
                        <div style="width: 70%;">KKBK00007461(NEFT/RTGS)</div>
                      </div>
                    </div>
                    <div><p class="footer-text">RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</p>
                  <p>Authorised Signatory</p></div>
                  </div>
                
              </div>
            </div>
            
          </div>
          <div>Plot No: 1308-A,   Road No; 65,   Jubilee Hills,  Hyderabad,  Telangana -5000333 </div>
        </body>
      </html>
    `;

    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();

      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };

  generateInvoiceHTML1(invoiceItem: InvoiceItem) {

    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();
    this.signature = this.imageService.getBase64Signature();
    const invoiceHTML = `
      <html>
        <head>
         
          <style>
           .invoice-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  background: #fff;
  font-family: Arial, sans-serif;
}
 .text-right {
              text-align: right;
            }
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom:2px solid #FFD700
}

.company-details {
  text-align: left;
}

.company-name {
  color: blue;
}

.invoice-logo .logo {
  width: 200px;
  height: 150px;

  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.signature-logo .logo {
  width: 300px;
  height: 150px;
  background: gray;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}


.invoice-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-top:10px;
   
}
  .invoice-number{
   font-weight: 600;
   font-size:20px
  }
 .bold {
    font-weight: bold;
   }
.billing-info {
      width: 100%;
    display: flex;
}
  .bank-booking-details {
  display: flex;
  width:100% !important
}
   .signature-details {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.invoice-table th, .invoice-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

.invoice-summary {
  text-align: right;
  margin-top: 20px;
}

.balance-due {
  color: blue;
  font-weight: bold;
}

.terms {
  margin-top: 20px;
}
       .table-bordered {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 10px;
            }
            
            .table-bordered th {
              padding: 5px;
            }
            .table-bordered td{
              padding: 5px;
            }

               thead th {
                background-color: #6ba3cd !important;
                color: white !important;
                vertical-align: middle !important;
                padding: 5px !important;
                font-weight: bold;
                text-align: center !important;
                font-size: 12px !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
                 .headerBackground, 
.bill-to div, 
.invoice-dates div,.bank-booking-details-container .bank-booking-details .bank div,.bank-booking-details-container .bank-booking-details .booking div, .invoice-cardHeader {
  text-align: center !important;
  background-color: #6ba3cd !important;
  color: white !important;
  padding: 5px;
  font-weight: bold;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
    margin-right: 2px !important;

}


                .bank-booking-details {
  display: flex;
  width: 100%;
  page-break-inside: avoid; /* Prevents splitting */
  justify-content: space-between;
}

.bank-booking-details-container {
  page-break-before: always; /* Moves to next page if needed */
}
 

          </style>
        </head>
        <body>
          <div id="invoice" class="invoice-container">
  <div class="header">
    <div class="invoice-logo">
      <h4>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h3>
    </div>
    <div class="invoice-logo">
      <div class="logo"><img src="${this.logoUrl}" alt="Company Logo" class="logo"></div>
    </div>
  </div>

  <div class="invoice-cardHeader">
    <strong><span class="invoice-number">${invoiceItem.proformaCardHeaderName}</span></strong>
  </div>
   <div class="invoice-title">
    <strong>INVOICE NO : <span class="invoice-number">${invoiceItem.invoiceUniqueNumber}</span></strong>
  </div>

  <div class="billing-info">
    <div class="bill-to " style="width:50%">
      <div style="text-align: center !important;background-color: #6ba3cd !important;">BILL TO</div>
      <p>${invoiceItem.header.ProformaCustomerName}</p>
      <p>${invoiceItem.header.ProformaAddress}</p>
      <p>${invoiceItem.header.ProformaCity}-${invoiceItem.header.ProformaPincode}</p>
      <p><strong>GST NO:</strong> ${invoiceItem.header.ProformaGstNo}</p>
       <p><strong>PAN NO:</strong>${invoiceItem.header.ProformaPan}</p>
    </div>
    
    <div class="invoice-dates" style="width:50%">
    <div style="text-align: center !important;background-color: #6ba3cd !important;">From</div>
      <p><strong>Invoice Date:</strong> ${invoiceItem.header.ProformaInvoiceDate}</p>
      <p><strong>PAN:</strong> ${invoiceItem.header.ProformaPanNO}</p>
      <p><strong>GST NO:</strong> ${invoiceItem.header.ProformaGstNumber}</p>
       <p><strong>TYPE OF AIRCRAFT:</strong> ${invoiceItem.header.ProformaTypeOfAircraft}</p>
       <p><strong>SEATING CAPACITY:</strong> ${invoiceItem.header.ProformaTypeOfAircraft}</p>
    </div>
  </div>

 <table class="table-bordered">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Description</th>
                  <th>Units (Hrs.)</th>
                  <th>Rate (INR)</th>
                  <th>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
             <tr>
              <td>1</td>
              <td class="bold">Charges</td>
              <td class="text-right"></td>
              <td class="text-right"></td>
              <td></td>
            </tr>
                ${invoiceItem.chargesList.map((charge, index) => `
                  <tr>
                   
                     <td class="text-center"></td>
                    <td>${charge.description}</td>
                    <td class="text-center">${charge.units ? charge.units : ''}</td>
                    <td class="text-right">${charge.rate}</td>
                    <td class="text-right">${charge.amount}</td>
                  </tr>
                `).join('')}
                
                <tr>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td class="text-right bold" >Total</td>
                  <td class="text-right bold" >${invoiceItem.subtotal}</td>
                </tr>
                <tr>
              <td>2</td>
                    <td class="bold">Taxes:</td>
                    <td></td>
                    <td></td>
                    <td></td>
              </tr>

                ${invoiceItem.taxList.map(tax => `
                  <tr>
                    <td></td>
                    <td>${tax.description}</td>
                    <td></td>
                    <td></td>
                    <td class="text-right">${tax.amount}</td>
                  </tr>
                `).join('')}

                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td class="text-right bold">Grand Total</td>
                  <td class="text-right bold">${invoiceItem.grandTotal}</td>
                </tr>
                <td colspan="5" class="bold"> ${invoiceItem.amountInWords}</td>
                </tr>
              </tbody>
            </table>

  

  <div class="bank-booking-details-container">
  <div class="bank-booking-details" >
  <div class="bank" style="width:50%">
    <div >BANK DETAILS</div>
      <p><strong>ACCOUNT NAME::</strong> RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</p>
      <p><strong>BANK:</strong> KOTAK MAHINDRA BANK</p>
      <p><strong>ACCOUNT NO:</strong> 0745211990</p>
       <p><strong>BRANCH:</strong> BANJARAHILLS</p>
       <p><strong>IFSC CODE:</strong> KKBK00007461(NEFT/RTGS)</p>
    </div>
   <div  class="booking" style="width:50%">
      <div >BOOKING DETAILS</div>
      <p><strong>Date Of Journey:</strong> ${invoiceItem.header.BookingDateOfJourny}</p>
      <p><strong>SECTOR:</strong> ${invoiceItem.header.BookingSector}</p>
      <p><strong>BILLING FLYING TIME:</strong> ${invoiceItem.header.BookingBillingFlyingTime} Hrs.</p>
    </div>
  </div>
   
  </div>
   <div class="notes">
        <p><strong>NOTES:</strong>${invoiceItem.header.notes}</p>           
   </div>
  <div class="header">
    <div class="signature-logo">
      <div class="logo"><img src="${this.InvoiceLogo}" alt="Company Logo" class="logo"></div>
    </div>
    <div class="signature-logo">
      <div class="logo"><img src="${this.signature}" alt="Company Logo" class="logo"></div>
        Authorised Signatory
    </div>
  </div>

</div>

</div>

      </html>
    `;

    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();

      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };

  generateInvoiceHTML2(invoiceItem: InvoiceItem) {

    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();
    this.signature = this.imageService.getBase64Signature();
    const invoiceHTML = `
      <html>
        <head>
         
          <style>
            body {
           .invoice-container {
  margin: 10px;
  padding: 20px;
  border: 1px solid #ccc;
  background: #fff;
  font-family: Arial, sans-serif;
}
 .text-right {
              text-align: right;
            }
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom:2px solid  #6ba3cd !important;
}

.company-details {
  text-align: left;
}

.company-name {
  color: blue;
}

.invoice-logo .logo {
  width: 200px;
  height: 150px;

  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.signature-logo .logo {
  width: 300px;
  height: 150px;
  background: gray;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}



  .invoice-number{
   font-weight: 600;
   font-size:20px
  }
 .bold {
    font-weight: bold;
   }
.billing-info {
      width: 100%;
    display: flex;
}
  .bank-booking-details {
  display: flex;
  width:100% !important
}
   .signature-details {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.invoice-table th, .invoice-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

.invoice-summary {
  text-align: right;
  margin-top: 20px;
}

.balance-due {
  color: blue;
  font-weight: bold;
}

.terms {
  margin-top: 20px;
}
       .table-bordered {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 10px;
            }
            
            .table-bordered th {
              padding: 5px;
            }
            .table-bordered td{
              padding: 5px;
            }

               thead th {
             background-color: green !important;
                color: white !important;
                vertical-align: middle !important;
                padding: 5px !important;
                font-weight: bold;
                text-align: center !important;
                font-size: 12px !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                border-right:2px solid white
              }
               tbody td .total{
  background-color: #6ba3cd !important
  }
                 .headerBackground, 
.bill-to div, 
.invoice-dates div,.bank-booking-details-container .bank-booking-details .bank div,
.bank-booking-details-container .bank-booking-details .booking div,
 .invoice-cardHeader {
  text-align: center !important;
  background-color: green !important;
  color: white !important;
  padding: 5px;
  font-weight: bold;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  margin-right: 2px !important;
}

                .bank-booking-details {
  display: flex;
  width: 100%;
  page-break-inside: avoid; /* Prevents splitting */
  justify-content: space-between;
}

.bank-booking-details-container {
  page-break-before: always; /* Moves to next page if needed */
}
  .invoice-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-top:10px;
  
}
   .total{
  background-color: #6ba3cd !important
  }
  @media print {
  .invoice-container {
  margin: 10px;
  padding: 20px;
  border: 1px solid #ccc;
  background: #fff;
  font-family: Arial, sans-serif;
}
 .text-right {
              text-align: right;
            }
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom:2px solid  #6ba3cd !important;
}

.company-details {
  text-align: left;
}

.company-name {
  color: blue;
}

.invoice-logo .logo {
  width: 200px;
  height: 150px;

  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.signature-logo .logo {
  width: 300px;
  height: 150px;
  background: gray;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}



  .invoice-number{
   font-weight: 600;
   font-size:20px
  }
 .bold {
    font-weight: bold;
   }
.billing-info {
      width: 100%;
    display: flex;
}
  .bank-booking-details {
  display: flex;
  width:100% !important
}
   .signature-details {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.invoice-table th, .invoice-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

.invoice-summary {
  text-align: right;
  margin-top: 20px;
}

.balance-due {
  color: blue;
  font-weight: bold;
}

.terms {
  margin-top: 20px;
}
       .table-bordered {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 10px;
            }
            
            .table-bordered th {
              padding: 5px;
            }
            .table-bordered td{
              padding: 5px;
            }

               thead th {
             background-color: green !important;
                color: white !important;
                vertical-align: middle !important;
                padding: 5px !important;
                font-weight: bold;
                text-align: center !important;
                font-size: 12px !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                border-right:2px solid white
              }
               tbody td .total{
  background-color: #6ba3cd !important
  }
                 .headerBackground, 
.bill-to div, 
.invoice-dates div,.bank-booking-details-container .bank-booking-details .bank div,
.bank-booking-details-container .bank-booking-details .booking div,
 .invoice-cardHeader {
  text-align: center !important;
  background-color: green !important;
  color: white !important;
  padding: 5px;
  font-weight: bold;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  margin-right: 2px !important;
}

                .bank-booking-details {
  display: flex;
  width: 100%;
  page-break-inside: avoid; /* Prevents splitting */
  justify-content: space-between;
}

.bank-booking-details-container {
  page-break-before: always; /* Moves to next page if needed */
}
  .invoice-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-top:10px;
  
}
   .total{
  background-color: #6ba3cd !important
  }
 
  
}


  }
          </style>
        </head>
  <body>
  <div id="invoice" class="invoice-container">
 
 <div class="invoice-title" >
  <div >
    ${invoiceItem.proformaCardHeaderName}
  </div>
</div>

  <div class="header">
    <div class="invoice-logo">
      <h4>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h4>
          <h4>INVOICE NO : <span class="invoice-number">${invoiceItem.invoiceUniqueNumber}</span></h4>

    </div>
    <div class="invoice-logo">
      <div class="logo"><img src="${this.logoUrl}" alt="Company Logo" class="logo"></div>
    </div>
  </div>

  <div class="billing-info">
    <div class="bill-to " style="width:50%">
      <div >BILL TO</div>
      <p>${invoiceItem.header.ProformaCustomerName}</p>
      <p>${invoiceItem.header.ProformaAddress}</p>
      <p>${invoiceItem.header.ProformaCity}-${invoiceItem.header.ProformaPincode}</p>
      <p><strong>GST NO:</strong> ${invoiceItem.header.ProformaGstNo}</p>
       <p><strong>PAN NO:</strong>${invoiceItem.header.ProformaPan}</p>
    </div>
    
    <div class="invoice-dates" style="width:50%">
    <div >From</div>
      <p><strong>Invoice Date:</strong> ${invoiceItem.header.ProformaInvoiceDate}</p>
      <p><strong>PAN:</strong> ${invoiceItem.header.ProformaPanNO}</p>
      <p><strong>GST NO:</strong> ${invoiceItem.header.ProformaGstNumber}</p>
       <p><strong>TYPE OF AIRCRAFT:</strong> ${invoiceItem.header.ProformaTypeOfAircraft}</p>
       <p><strong>SEATING CAPACITY:</strong> ${invoiceItem.header.ProformaTypeOfAircraft}</p>
    </div>
  </div>

 <table class="table-bordered">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Description</th>
                  <th>Units (Hrs.)</th>
                  <th>Rate (INR)</th>
                  <th>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
             <tr>
              <td>1</td>
              <td class="bold">Charges</td>
              <td class="text-right"></td>
              <td class="text-right"></td>
              <td></td>
            </tr>
                ${invoiceItem.chargesList.map((charge, index) => `
                  <tr>
                   
                     <td class="text-center"></td>
                    <td>${charge.description}</td>
                    <td class="text-center">${charge.units ? charge.units : ''}</td>
                    <td class="text-right">${charge.rate}</td>
                    <td class="text-right">${charge.amount}</td>
                  </tr>
                `).join('')}
                
                <tr>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                   <td  class="text-right bold" >Total</td>
                  <td class="text-right bold"  >${invoiceItem.subtotal}</td>
                </tr>
                <tr>
              <td>2</td>
                    <td class="bold">Taxes:</td>
                    <td></td>
                    <td></td>
                    <td></td>
              </tr>

                ${invoiceItem.taxList.map(tax => `
                  <tr>
                    <td></td>
                    <td>${tax.description}</td>
                    <td></td>
                    <td></td>
                    <td class="text-right">${tax.amount}</td>
                  </tr>
                `).join('')}

                <tr >
                  <td></td>
                  <td></td>
                  <td></td>
                  <td class="text-right bold total"  >Grand Total</td>
                  <td class="text-right bold total"  >${invoiceItem.grandTotal}</td>
                </tr>
                <td colspan="5" class="bold"> ${invoiceItem.amountInWords}</td>
                </tr>
              </tbody>

            </table>

           
  <div class="bank-booking-details-container">
  <div class="bank-booking-details" >
  <div class="bank" style="width:50%">
    <div >BANK DETAILS</div>
      <p><strong>ACCOUNT NAME::</strong> RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</p>
      <p><strong>BANK:</strong> KOTAK MAHINDRA BANK</p>
      <p><strong>ACCOUNT NO:</strong> 0745211990</p>
       <p><strong>BRANCH:</strong> BANJARAHILLS</p>
       <p><strong>IFSC CODE:</strong> KKBK00007461(NEFT/RTGS)</p>
    </div>
   <div  class="booking" style="width:50%">
      <div >BOOKING DETAILS</div>
      <p><strong>Date Of Journey:</strong> ${invoiceItem.header.BookingDateOfJourny}</p>
      <p><strong>SECTOR:</strong> ${invoiceItem.header.BookingSector}</p>
      <p><strong>BILLING FLYING TIME:</strong> ${invoiceItem.header.BookingBillingFlyingTime} Hrs.</p>
    </div>
  </div>
   
  </div>
   <div class="notes">
        <p><strong>NOTES:</strong>${invoiceItem.header.notes}</p>           
   </div>
  <div class="header">
    <div class="signature-logo">
      <div class="logo"><img src="${this.InvoiceLogo}" alt="Company Logo" class="logo"></div>
    </div>
    <div class="signature-logo">
      <div class="logo"><img src="${this.signature}" alt="Company Logo" class="logo"></div>
        Authorised Signatory
    </div>
  </div>

</div>

</div>

      </html>
    `;

    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();

      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };
  generateInvoiceHTML3(invoiceItem: InvoiceItem) {
    this.logoUrl = this.imageService.getBase64FlightLogo(); 
    this.InvoiceLogo = this.imageService.getBase64WorldLogo(); 
    this.signature = this.imageService.getBase64Signature();
    const invoiceHTML = `
    <html>
        <head>
         
          <style>
           body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 5px;
      background-color: white;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-size:13px
    }

           container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  background: #fff;
}
 .text-right {
              text-align: right;
            }
 .invoice-header {
 text-align: center;
      justify-content: space-between;
      margin-bottom: 10px;
      background: lightslategrey;
      color: white;
      padding: 10px;
      font-size: 15px;
      height: 140px;

}
        .invoice-sections {
      display: flex;
      /* Use flexbox for side-by-side layout */
      justify-content: space-between;
      margin-top: 20px;
      /* Space sections evenly */
    }

    .invoice-section {
      width: 45%;
      /* Adjust width as needed */
      padding: 5px;
      border: 1px solid #ccc;
    }


.company-details {
  text-align: left;
}

.company-name {
  color: white;
}
   .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
    }
      

.invoice-logo .logo {
  width: 200px;
  height: 150px;

  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.signature-logo .logo {
  height: 90px;
  background: gray;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}
 .invoice-info {
      display: flex;
      justify-content: space-between;
    }

    .invoice-meta p {
      margin: 3px 0;
    }

    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size:12px !important
    }

    .invoice-table th,
    .invoice-table td {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: left;
    }

    .invoice-summary {
       text-align: right;
  margin-top: 20px;
    }
       .notes {
            font-size: 12px; /* Reduce font size for notes */
        }


    .balance {
      background: lightslategrey;
      color: white;
      padding: 10px;
      text-align: right;
      font-size: 18px;
    }

    .amount {
      font-size: 20px;
    }

    .payment-info {
      margin-top: 15px;
      font-size: 14px;
    }
      .invoice-details {
  display: flex;
  justify-content: space-between;
    color: black;
}

.detail-item {
  margin-right: 20px; /* Adjust margin as needed */
}



  .invoice-number{
   font-weight: 600;
   font-size:20px
  }
 .bold {
    font-weight: bold;
   }
.billing-info {
      width: 100%;
    display: flex;
}
.booking-details-container {
    display: flex; /* Use flexbox for horizontal layout */
    justify-content: space-between; /* Space items evenly */
    align-items: center; /* Vertically center items */
}
   .signature-details {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
  .booking-details-item {
    margin: 0 10px; /* Add some spacing between items */
}

.booking-details-item span {
    display: block; /* Make spans block-level for better control */
}

  .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

 .invoice-table th,
    .invoice-table td {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: left;
    }

.invoice-summary {
  text-align: right;
  margin-top: 20px;
}

.balance {
      background: lightslategrey;
      color: white;
      padding: 10px;
      text-align: right;
      font-size: 18px;
    }


.total-row p {
  margin-left: 10px; /* Add spacing between TOTAL and GRAND TOTAL */
}
   .logo{
     height: 142px;
    }
   .total-row {
 
 display:flex !important
}

       
  @media print {
  
   body {
        margin: 0;
        padding: 8px;
        font-size:12px
      }
         .invoice-details {
  display: flex;
  justify-content: space-between;
    color: black;
        .invoice-header {
 text-align: center;
      justify-content: space-between;
      margin-bottom: 10px;
      background: lightslategrey;
      color: black;
      padding: 10px;
      font-size: 15px;
      height: 140px;

}
      .total-row {
 
 display:flex !important
}

      
        .table-bordered {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 10px;
            }
             .table-bordered th {
              padding: 5px;
            }
            .table-bordered td{
              padding: 5px;
            }
      
               thead tr {
        background-color: skyblue !important;
        color: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
        .notes {
            font-size: 12px; /* Reduce font size for notes */
        }

                thead th {
        background-color: skyblue !important;
        color: white !important;
        vertical-align: middle !important;
        padding: 5px !important;
        font-weight: bold;
        text-align: center !important;
        font-size: 12px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
                 .headerBackground, 
.bill-to div, 
.invoice-dates div,.bank-booking-details-container .bank-booking-details .bank div,
.bank-booking-details-container .bank-booking-details .booking div,
 .invoice-cardHeader {
  text-align: center !important;
  background-color: green !important;
  color: white !important;
  padding: 5px;
  font-weight: bold;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  margin-right: 2px !important;
}

    .booking-title {
        background-color:skyblue !important;
        color: black !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }


  .invoice-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-top:10px;
  
}
        .from-section {
        display: inline-block;
        margin-right: 10px;
      }
      .to-section {
        display: inline-block;
        margin-right: 10px;
      }

      .booking-details {
        display: inline-block;
      }
         .invoice-table {
                font-size: 12px; /* Further reduce font size for table content */
            }
                .logo{
                height: 142px;
                }
        

}
 

          </style>
        </head>
  <body>
  <div class="container">
    <div class="invoice-header">
      <div class="company-name">RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</div>
      <div class="logo">
        <img src="${this.logoUrl}" alt="Company Logo" class="logo">
      </div>
    </div>
    
    <div class="invoice-sections">
      <div class="invoice-section from" style="width: 50%;">
        <div style="font-weight: bold; font-size: 16px; background: #6ba3cd !important; color: white;text-align: center;">FROM</div>
        <p><span style="font-weight: bold; font-size: 12px;">Invoice No:</span>
          ${invoiceItem.invoiceUniqueNumber}</p>
        <p><span style="font-weight: bold; font-size: 12px;">Date:</span> ${invoiceItem.header.ProformaInvoiceDate}</p>
        <p><span style="font-weight: bold; font-size: 12px;">PAN NO:</span> ${invoiceItem.header.ProformaPanNO}</p>
        <p><span style="font-weight: bold; font-size: 12px;">GST NO:</span> ${invoiceItem.header.ProformaGstNumber}</p>
        <p><span style="font-weight: bold; font-size: 12px;">Type of Aircraft:</span>
          ${invoiceItem.header.ProformaTypeOfAircraft}</p>
        <p><span style="font-weight: bold; font-size: 12px;">Seating Capacity:</span>
          ${invoiceItem.header.ProformaSeatingCapasity}</p>
      </div>

      <div class="invoice-section to" style="width: 50%;">
        <div style="font-weight: bold; font-size: 16px; background: #6ba3cd !important; color: white;text-align: center;">TO</div>
        <p><span style="font-weight: bold; font-size: 12px;">Customer Name:</span>
          ${invoiceItem.header.ProformaCustomerName}</p>
        <p><span style="font-weight: bold; font-size: 12px;">Address:</span> ${invoiceItem.header.ProformaAddress}</p>
        <p><span style="font-weight: bold; font-size: 12px;">City - State - Pincode:</span>
          ${invoiceItem.header.ProformaCity} - ${invoiceItem.header.ProformaState} -
          ${invoiceItem.header.ProformaPincode}</p>
        <p><span style="font-weight: bold; font-size: 12px;">PAN NO:</span> ${invoiceItem.header.ProformaPan}</p>
        <p><span style="font-weight: bold; font-size: 12px;">GST NO:</span> ${invoiceItem.header.ProformaGstNo}</p>
      </div>
      <div class="invoice-section booking-details">
        
          <div style="font-weight: bold; font-size: 16px;background: #6ba3cd !important; color: white;text-align: center;">BANK DETAILS</div>
          <p><span style="font-weight: bold; font-size: 12px;">ACCOUNT NAME:</span> RITHWIK GREEN POWER & AVIATION
            PRIVATE LIMITED</p>
          <p><span style="font-weight: bold; font-size: 12px;">BANK:</span> KOTAK MAHINDRA BANK</p>
          <p><span style="font-weight: bold; font-size: 12px;">ACCOUNT NO:</span> 0745211990</p>
          <p><span style="font-weight: bold; font-size: 12px;">BRANCH:</span> BANJARAHILLS</p>
          <p><span style="font-weight: bold; font-size: 12px;">IFSC CODE:</span> KKBK00007461(NEFT/RTGS)</p>
        
      </div> 
    </div>
     <div class="invoice-details">
  <div class="detail-item">
    <p><strong>Date Of Journey:</strong> ${invoiceItem.header.BookingDateOfJourny}</p>
  </div>
  <div class="detail-item">
    <p><strong>SECTOR:</strong> ${invoiceItem.header.BookingSector}</p>
  </div>
  <div class="detail-item">
    <p><strong>BILLING FLYING TIME:</strong> ${invoiceItem.header.BookingBillingFlyingTime}</p>
  </div>
</div>
    <div>
      <table class="invoice-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Description</th>
            <th>Units (Hrs.)</th>
            <th>Rate (INR)</th>
            <th>Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td class="bold">Charges</td>
            <td class="text-right"></td>
            <td class="text-right"></td>
            <td></td>
          </tr>
          ${invoiceItem.chargesList.map((charge, index) => `
          <tr>
            <td class="text-center"></td>
            <td>${charge.description}</td>
            <td class="text-center">${charge.units ? charge.units : ''}</td>
            <td class="text-right">${charge.rate}</td>
            <td class="text-right">${charge.amount}</td>
          </tr>
          `).join('')}


          <tr>
            <td>2</td>
            <td class="bold">Taxes:</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>

          ${invoiceItem.taxList.map(tax => `
          <tr>
            <td></td>
            <td>${tax.description}</td>
            <td></td>
            <td></td>
            <td class="text-right">${tax.amount}</td>
          </tr>
            
          `).join('')}
          <tr>
           <td colspan="5" class="bold"> ${invoiceItem.amountInWords}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="total-row">
   <div class="notes" style="width:70%">
        <p><strong>NOTES:</strong>${invoiceItem.header.notes}</p>           
   </div>
    <div style="width:30%;justify-items: center;">
    <p><strong>TOTAL:</strong> ${invoiceItem.subtotal}</p>
    <p><strong>GRAND TOTAL:</strong> ${invoiceItem.grandTotal}</p>
    </div>
  </div>  
 
            

  <div class="header">
    <div class="signature-logo">
      <div class="logo"><img src="${this.InvoiceLogo}" alt="Company Logo" class="logo"></div>
    </div>
    <div class="signature-logo">
      <div class="logo"><img src="${this.signature}" alt="Company Logo" class="logo"></div>
        Authorised Signatory
    </div>
  </div>

</div>


</div>
<body>

      </html>
    `;

  const newWindow = window.open('', '', 'height=600,width=800');
  if (newWindow) {
    newWindow.document.write(invoiceHTML);
    newWindow.document.close();

    setTimeout(() => {
      newWindow.print();
    }, 500);
  }
}
generateInvoiceHTML4(invoiceItem: InvoiceItem) {
  this.logoUrl = this.imageService.getBase64FlightLogo();
  this.InvoiceLogo = this.imageService.getBase64WorldLogo();
  this.signature = this.imageService.getBase64Signature();
  const invoiceHTML = `
    <html>
        <head>
         
          <style>
           body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 5px;
      background-color: white;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-size: 10px;
    }

           container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  background: #fff;
}
 .text-right {
              text-align: right;
            }
 .invoice-header {
 text-align: center;
      justify-content: space-between;
      margin-bottom: 10px;
      background: #AFEEEE;
      color: white;
      padding: 10px;
      font-size: 15px;
      height: 130px;

}
        .invoice-sections {
      display: flex;
      /* Use flexbox for side-by-side layout */
      justify-content: space-between;
      margin-top: 20px;
      /* Space sections evenly */
    }

    .invoice-section {
      width: 45%;
      /* Adjust width as needed */
      padding: 5px;
      border: 1px solid #ccc;
    }


.company-details {
  text-align: left;
}

.company-name {
  color: blue;
}
   .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
    }
      

.invoice-logo .logo {
  width: 200px;
  height: 150px;

  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.signature-logo .logo {
  
  height: 150px;
  background: gray;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}
 .invoice-info {
      display: flex;
      justify-content: space-between;
    }

    .invoice-meta p {
      margin: 3px 0;
    }

    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size:9px !important
    }

    .invoice-table th,
    .invoice-table td {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: left;
    }

    .invoice-summary {
      margin-top: 15px;
    }
        .notes {
            font-size: 9px; /* Reduce font size for notes */
        }

    .balance {
      background: lightslategrey;
      color: white;
      padding: 10px;
      text-align: right;
      font-size: 18px;
    }

    .amount {
      font-size: 20px;
    }

    .payment-info {
      margin-top: 15px;
      font-size: 14px;
    }
      .invoice-details {
  display: flex;
  justify-content: space-between;
}

.detail-item {
  margin-right: 20px; /* Adjust margin as needed */
}



  .invoice-number{
   font-weight: 600;
   font-size:20px
  }
 .bold {
    font-weight: bold;
   }
.billing-info {
      width: 100%;
    display: flex;
}
.booking-details-container {
    display: flex; /* Use flexbox for horizontal layout */
    justify-content: space-between; /* Space items evenly */
    align-items: center; /* Vertically center items */
}
   .signature-details {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
  .booking-details-item {
    margin: 0 10px; /* Add some spacing between items */
}

.booking-details-item span {
    display: block; /* Make spans block-level for better control */
}




.invoice-summary {
  text-align: right;
  margin-top: 20px;
}

.balance {
      background: lightslategrey;
      color: white;
      padding: 10px;
      text-align: right;
      font-size: 18px;
    }



       
  @media print {
   body {
        margin: 0;
        padding: 8px;
      }
        .table-bordered {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 10px;
            }
            
            .table-bordered th {
              padding: 5px;
            }
            .table-bordered td{
              padding: 5px;
            }
               thead tr {
        background-color:teal !important;
        color: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

                thead th {
        background-color:teal !important;
        color: white !important;
        vertical-align: middle !important;
        padding: 5px !important;
        font-weight: bold;
        text-align: center !important;
        font-size: 12px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
                 .headerBackground, 
.bill-to div, 
.invoice-dates div,.bank-booking-details-container .bank-booking-details .bank div,
.bank-booking-details-container .bank-booking-details .booking div,
 .invoice-cardHeader {
  text-align: center !important;
  background-color: green !important;
  color: white !important;
  padding: 5px;
  font-weight: bold;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  margin-right: 2px !important;
}

    .booking-title {
        background-color: teal !important;
        color: black !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }


  .invoice-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-top:10px;
  
}
        .from-section {
        display: inline-block;
        margin-right: 10px;
      }

      .to-section {
        display: inline-block;
        margin-right: 10px;
      }

      .booking-details {
        display: inline-block;
      }
            .invoice-table {
                font-size: 7px; /* Further reduce font size for table content */
            }
        

}
 

          </style>
        </head>
    <body>
      <div class="container">
    <div class="invoice-header">
      <div style="display: flex; justify-content: space-between;">
        <div class="invoice-logo">
      <div class="logo"><img src="${this.logoUrl}" alt="Company Logo" class="logo"></div>
    </div>
        <div class="invoice-logo">
    <h4 style="color: black;">RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h4>
    <h4 style="color: black;">INVOICE NO : <span class="invoice-number">${invoiceItem.invoiceUniqueNumber}</span></h4>
</div>
      </div>
    </div>

         <div class="invoice-sections">
  <div class="invoice-section from" style="width: 50%;">
    <div style="font-weight: bold; font-size: 16px; background:teal;  color: white;">FROM</div>
    <p><span style="font-weight: bold; font-size: 12px;">Date:</span> ${invoiceItem.header.ProformaInvoiceDate}</p>
    <p><span style="font-weight: bold; font-size: 12px;">PAN NO:</span> ${invoiceItem.header.ProformaPanNO}</p>
    <p><span style="font-weight: bold; font-size: 12px;">GST NO:</span> ${invoiceItem.header.ProformaGstNumber}</p>
    <p><span style="font-weight: bold; font-size: 12px;">Type of Aircraft:</span> ${invoiceItem.header.ProformaTypeOfAircraft}</p>
    <p><span style="font-weight: bold; font-size: 12px;">Seating Capacity:</span> ${invoiceItem.header.ProformaSeatingCapasity}</p>
  </div>

  <div class="invoice-section to" style="width: 50%;">
    <div style="font-weight: bold; font-size: 16px; background:teal;  color: white;">TO</div>
    <p><span style="font-weight: bold; font-size: 12px;">Customer Name:</span> ${invoiceItem.header.ProformaCustomerName}</p>
    <p><span style="font-weight: bold; font-size: 12px;">Address:</span> ${invoiceItem.header.ProformaAddress}</p>
    <p><span style="font-weight: bold; font-size: 12px;">City - State - Pincode:</span> ${invoiceItem.header.ProformaCity} - ${invoiceItem.header.ProformaState} - ${invoiceItem.header.ProformaPincode}</p>
    <p><span style="font-weight: bold; font-size: 12px;">PAN NO:</span> ${invoiceItem.header.ProformaPan}</p>
    <p><span style="font-weight: bold; font-size: 12px;">GST NO:</span> ${invoiceItem.header.ProformaGstNo}</p>
  </div>

  <div class="invoice-section booking-details">
    <div style="font-weight: bold; font-size: 16px; background:teal;  color: white;">BOOKING DETAILS</div>
    <p><span style="font-weight: bold; font-size: 12px;">Date Of Journey:</span> ${invoiceItem.header.BookingDateOfJourny}</p>
    <p><span style="font-weight: bold; font-size: 12px;">SECTOR:</span> ${invoiceItem.header.BookingSector}</p>
    <p><span style="font-weight: bold; font-size: 12px;">BILLING FLYING TIME:</span> ${invoiceItem.header.BookingBillingFlyingTime} Hrs.</p>
  </div>
   
</div>
      <div>
        <table class="invoice-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Description</th>
              <th>Units (Hrs.)</th>
              <th>Rate (INR)</th>
              <th>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td class="bold">Charges</td>
              <td class="text-right"></td>
              <td class="text-right"></td>
              <td></td>
            </tr>
            ${invoiceItem.chargesList.map((charge, index) => `
              <tr>
                <td class="text-center"></td>
                <td>${charge.description}</td>
                <td class="text-center">${charge.units ? charge.units : ''}</td>
                <td class="text-right">${charge.rate}</td>
                <td class="text-right">${charge.amount}</td>
              </tr>
            `).join('')}

            <tr>
                    
                    <td></td>
                    <td></td>
                    <td></td>
                    <th>TOTAL:</th>
                     <td class="text-right"> ${invoiceItem.subtotal}</td>
                </tr>
            <tr>
              <td>2</td>
              <td class="bold">Taxes:</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>

            ${invoiceItem.taxList.map(tax => `
              <tr>
                <td></td>
                <td>${tax.description}</td>
                <td></td>
                <td></td>
                <td class="text-right">${tax.amount}</td>
              </tr>
              
            `).join('')}
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <th>GRAND TOTAL:</th>
              <td class="text-right"> ${invoiceItem.grandTotal}</td>
                </tr>
                <tr>
              
              <td colspan="4"> ${invoiceItem.amountInWords}</td>
                </tr>
                
             </tbody>
        </table>
    </div>
  </div>  
      
   
  <div class="notes">
        <div><p><strong>NOTES:</strong>${invoiceItem.header.notes}</p></div>    
           
  </div>
  
  
    <div class="header">
      <div class="invoice-section bank-details" style="width: 50%;">
        <div style="font-weight: bold; font-size: 16px; background:teal; color: white;">BANK DETAILS</div>
        <p><span style="font-weight: bold; font-size: 12px;">ACCOUNT NAME:</span> RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</p>
        <p><span style="font-weight: bold; font-size: 12px;">BANK:</span> KOTAK MAHINDRA BANK</p>
        <p><span style="font-weight: bold; font-size: 12px;">ACCOUNT NO:</span> 0745211990</p>
        <p><span style="font-weight: bold; font-size: 12px;">BRANCH:</span> BANJARAHILLS</p>
        <p><span style="font-weight: bold; font-size: 12px;">IFSC CODE:</span> KKBK00007461(NEFT/RTGS)</p>
      </div>
      
      <div class="signature-logo" style="width: 50%;text-align:center">
        <div class="logo"><img src="${this.signature}" alt="Company Logo" class="logo"></div>
          Authorised Signatory
        </div>
      </div>
    </div>
      </html>
    `;

    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();

      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };
  generateInvoiceHTML5(invoiceItem: InvoiceItem) {

    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogoTransparent();
    this.signature = this.imageService.getBase64Signature();
    const invoiceHTML = `
      <html>
        <head>
         
          <style>
           body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 5px;
      background-color: white;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-size: 10px;
    }

           container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  background: #fff;
}
 .text-right {
              text-align: right;
            }
 .invoice-header {
 text-align: center;
      justify-content: space-between;
      margin-bottom: 10px;
       background-color: lightblue;
      color: white;
      padding: 10px;
      font-size: 15px;
      height: 96px;

}
        .invoice-sections {
      display: flex;
      /* Use flexbox for side-by-side layout */
      justify-content: space-between;
      margin-top: 20px;
      /* Space sections evenly */
    }

    .invoice-section {
      width: 45%;
      /* Adjust width as needed */
      padding: 5px;
      border: 1px solid #ccc;
      font-weight: bold;
    }


.company-details {
  text-align: left;
}

.company-name {
  color: blue;
}
   .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      font-weight: bold;
      
    }
      

.invoice-logo .logo {
  height: 98px;
  display: flex;
  align-items: end;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.signature-logo .logo {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}
  
 .invoice-info {
      display: flex;
      justify-content: space-between;
    }

    .invoice-meta p {
      margin: 3px 0;
    }

    .invoice-table {
      width: 100%;
      margin-top: 1px;
      font-size:12px !important;
      border: 2px solid rgb(88 98 145) !important;  color: black;
    }

    .invoice-table th,
    .invoice-table td {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: center;
      font-weight: bold;
    }

    .invoice-summary {
     text-align: right;
      margin-top: 20px;
    }
        .notes {
            font-size: 9px; /* Reduce font size for notes */
        }

    .balance {
      background: lightslategrey;
      color: white;
      padding: 10px;
      text-align: right;
      font-size: 18px;
    }

    .amount {
      font-size: 20px;
    }

    .payment-info {
      margin-top: 15px;
      font-size: 14px;
    }
      .invoice-details {
  display: flex;
  justify-content: space-between;
}

.detail-item {
  margin-right: 20px; /* Adjust margin as needed */
}



  .invoice-number{
   font-weight: 600;
   font-size:20px
  }
 .bold {
    font-weight: bold;
   }
.billing-info {
      width: 100%;
    display: flex;
}
.booking-details-container {
    display: flex; /* Use flexbox for horizontal layout */
    justify-content: space-between; /* Space items evenly */
    align-items: center; /* Vertically center items */
}
   .signature-details {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
  .booking-details-item {
    margin: 0 10px; /* Add some spacing between items */
}

.booking-details-item span {
    display: block; /* Make spans block-level for better control */
}




.invoice-summary {
  text-align: right;
  margin-top: 20px;
}

.balance {
      background: lightslategrey;
      color: white;
      padding: 10px;
      text-align: right;
      font-size: 18px;
    }



       
  @media print {
   body {
        margin: 0;
        padding: 8px;
      }
        .table-bordered {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 10px;
            }
            
            .table-bordered th {
              padding: 5px;
            }
            .table-bordered td{
              padding: 5px;
            }
               thead tr {
       border: 2px solid rgb(88 98 145) !important;  color: black;
        color: black !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

                thead th {
       border: 2px solid rgb(88 98 145) !important;  color: black;
        color: black !important;
        vertical-align: middle !important;
        padding: 5px !important;
        font-weight: bold;
        text-align: center !important;
        font-size: 12px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
                 .headerBackground, 
.bill-to div, 
.invoice-dates div,.bank-booking-details-container .bank-booking-details .bank div,
.bank-booking-details-container .bank-booking-details .booking div,
 .invoice-cardHeader {
  text-align: center !important;
  background-color: green !important;
  color: white !important;
  padding: 5px;
  font-weight: bold;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  margin-right: 2px !important;
}

    .booking-title {
        background-color: teal !important;
        color: black !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }


  .invoice-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-top:10px;
  
}
        .from-section {
        display: inline-block;
        margin-right: 10px;
      }

      .to-section {
        display: inline-block;
        margin-right: 10px;
      }

      .booking-details {
        display: inline-block;
      }
            .invoice-table {
                font-size: 12px; /* Further reduce font size for table content */
            }
        

}
 

          </style>
        </head>
  <body>
 <div class="container">
    <div class="invoice-header">
      <div style="display: flex; justify-content: space-between;">
        <div class="invoice-logo">
      <div class="logo"><img src="${this.logoUrl}" alt="Company Logo" class="logo"></div>
    </div>
        <div class="invoice-logo" style="color:black;margin-top: 40px;">
        ${invoiceItem.proformaCardHeaderName}
      </div>
      <div class="invoice-logo">
        <div class="logo"><img src="${this.InvoiceLogo}" alt="Company Logo" class="logo"></div>
      </div>

      </div>
    </div>

         <div class="invoice-sections">
  <div class="invoice-section from" style="width: 50%;">
    <div style="font-weight: bold; font-size: 16px;  border: 2px solid rgb(88 98 145) !important;  color: black;">FROM</div>
    <p><span style="font-weight: bold; font-size: 12px;">Date:</span> ${invoiceItem.header.ProformaInvoiceDate}</p>
    <p><span style="font-weight: bold; font-size: 12px;">PAN NO:</span> ${invoiceItem.header.ProformaPanNO}</p>
    <p><span style="font-weight: bold; font-size: 12px;">GST NO:</span> ${invoiceItem.header.ProformaGstNumber}</p>
    <p><span style="font-weight: bold; font-size: 12px;">Type of Aircraft:</span> ${invoiceItem.header.ProformaTypeOfAircraft}</p>
    <p><span style="font-weight: bold; font-size: 12px;">Seating Capacity:</span> ${invoiceItem.header.ProformaSeatingCapasity}</p>
  </div>

  <div class="invoice-section to" style="width: 50%;">
    <div style="font-weight: bold; font-size: 16px;  border: 2px solid rgb(88 98 145) !important;  color: black;">TO</div>
    <p><span style="font-weight: bold; font-size: 12px;">Customer Name:</span> ${invoiceItem.header.ProformaCustomerName}</p>
    <p><span style="font-weight: bold; font-size: 12px;">Address:</span> ${invoiceItem.header.ProformaAddress}</p>
    <p><span style="font-weight: bold; font-size: 12px;">City - State - Pincode:</span> ${invoiceItem.header.ProformaCity} - ${invoiceItem.header.ProformaState} - ${invoiceItem.header.ProformaPincode}</p>
    <p><span style="font-weight: bold; font-size: 12px;">PAN NO:</span> ${invoiceItem.header.ProformaPan}</p>
    <p><span style="font-weight: bold; font-size: 12px;">GST NO:</span> ${invoiceItem.header.ProformaGstNo}</p>
  </div>

  <div class="invoice-section booking-details">
    <div style="font-weight: bold; font-size: 16px;  border: 2px solid rgb(88 98 145) !important;  color: black;">BOOKING DETAILS</div>
    <p><span style="font-weight: bold; font-size: 12px;">Date Of Journey:</span> ${invoiceItem.header.BookingDateOfJourny}</p>
    <p><span style="font-weight: bold; font-size: 12px;">SECTOR:</span> ${invoiceItem.header.BookingSector}</p>
    <p><span style="font-weight: bold; font-size: 12px;">BILLING FLYING TIME:</span> ${invoiceItem.header.BookingBillingFlyingTime} Hrs.</p>
  </div>
   
</div>
      <div>
        <table class="invoice-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Description</th>
              <th>Units (Hrs.)</th>
              <th>Rate (INR)</th>
              <th>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td class="bold">Charges</td>
              <td class="text-right"></td>
              <td class="text-right"></td>
              <td></td>
            </tr>
            ${invoiceItem.chargesList.map((charge, index) => `
              <tr>
                <td class="text-center"></td>
                <td>${charge.description}</td>
                <td class="text-center">${charge.units ? charge.units : ''}</td>
                <td class="text-right">${charge.rate}</td>
                <td class="text-right">${charge.amount}</td>
              </tr>
            `).join('')}

            <tr>
                    
                    <td></td>
                    <td></td>
                    <td></td>
                    <th>TOTAL:</th>
                     <td class="text-right"> ${invoiceItem.subtotal}</td>
                </tr>
            <tr>
              <td>2</td>
              <td class="bold">Taxes:</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>

            ${invoiceItem.taxList.map(tax => `
              <tr>
                <td></td>
                <td>${tax.description}</td>
                <td></td>
                <td></td>
                <td class="text-right">${tax.amount}</td>
              </tr>
              
            `).join('')}
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <th>GRAND TOTAL:</th>
              <td class="text-right"> ${invoiceItem.grandTotal}</td>
                </tr>
          <tr>
           <td colspan="5" class="bold"> ${invoiceItem.amountInWords}</td>
          </tr>
             </tbody>
        </table>
    </div>
  </div>  
      
   
  <div class="notes">
        <div><p><strong>NOTES:</strong>${invoiceItem.header.notes}</p></div>    
           
  </div>
  
  
    <div class="header">
      <div class="invoice-section bank-details" style="width: 50%;">
        <div style="font-weight: bold; font-size: 16px; border: 2px solid rgb(88 98 145) !important;  color: black;">BANK DETAILS</div>
        <p><span style="font-weight: bold; font-size: 12px;">ACCOUNT NAME:</span> RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</p>
        <p><span style="font-weight: bold; font-size: 12px;">BANK:</span> KOTAK MAHINDRA BANK</p>
        <p><span style="font-weight: bold; font-size: 12px;">ACCOUNT NO:</span> 0745211990</p>
        <p><span style="font-weight: bold; font-size: 12px;">BRANCH:</span> BANJARAHILLS</p>
        <p><span style="font-weight: bold; font-size: 12px;">IFSC CODE:</span> KKBK00007461(NEFT/RTGS)</p>
      </div>
      
      <div class="signature-logo" style="width: 50%;text-align:center">
        <div class="logo"><img src="${this.signature}" alt="Company Logo" class="logo"></div>
          Authorised Signatory
        </div>
      </div>
    </div>
      </html>
    `;

    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();

      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };
  generateInvoiceHTML6 (invoiceItem: InvoiceItem) {
 
    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();
    this.signature = this.imageService.getBase64Signature();
    const invoiceHTML = `
    // <!DOCTYPE html>
<html>
<head>
 
  <style>
      .invoice-container {
  margin: 10px;
  padding: 20px;
  border: 1px solid #ccc;
  background: #fff;
  font-family: Arial, sans-serif;
}
   body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 5px;
              background-color: white;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-size: 12px;
            }
       
          .invoice-container {
            width: 100%;
            margin: auto;
            border: 1px solid #ddd;
            padding: 10px;
            background: #fff;
            box-sizing: border-box;
        }
 
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    .header-section .logo {
      width: 50%;
      text-align: right;
    }
    .header-section img {
      max-width: 100%;
      height: auto;
    }
       .logo img {
            max-width: 100px;
            height: auto;
        }
    .orange-background {
   
      background-color: rgb(181, 179, 200);
      font-size: 15px;
      color:white;
      padding: 8px;
      text-align: center;
      font-weight: bold;
    }
    .table-bordered {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 10px;
      // background-color:rgb(193, 205, 217); /* Added background color */
    }
     .table-bordered th {
        border: 1px solid white;
    padding: 2px;
    background: rgb(88 98 145) !important;
    color: white;
    }
 
    .table-bordered td {
    padding: 2px;
    }
   
 
   
       
    .bold {
      font-weight: bold;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
   .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-top: 10px;
        }
 
        .footer .logo {
            width: 50%;
        }
 
        .footer .logo img {
            width: 100%;
            height: auto;
        }
     
    @media print {
   body {
        margin: 0;
        padding: 8px;
      }
        .orange-background {
      background-color: rgb(181, 179, 200);
      font-size: 18px !important;
      color:black;
      padding: 8px;
      text-align: center;
      font-weight: bold;
    }
}

  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header-section">
      <div class="logo"><h3>INVOICE NO: ${invoiceItem.invoiceUniqueNumber}</h3></div>
      <div class="logo"><img src="${this.logoUrl}" alt="Invoice Logo"></div>
    </div>
    <div class="orange-background">${invoiceItem.proformaCardHeaderName}</div>
    <br>
   
    <table class="table-bordered">
      <tr>
        <th class="bold">TO</th>
        <th class="bold">FROM</th>
      </tr>
      <tr>
        <td>${invoiceItem.header.ProformaCustomerName}<br>${invoiceItem.header.ProformaAddress}<br>${invoiceItem.header.ProformaCity}<br>${invoiceItem.header.ProformaPincode} <br><strong>GST NO:</strong>${invoiceItem.header.ProformaGstNo}<br>
                <strong>PAN NO:</strong> ${invoiceItem.header.ProformaPan}</td>
        <td><strong>INVOICE NO:</strong> ${invoiceItem.invoiceUniqueNumber}<br<strong>DATE: </strong>${invoiceItem.header.ProformaInvoiceDate}<br><strong>PAN NO</strong>: ${invoiceItem.header.ProformaPanNO}<br><strong>GST NO: </strong>${invoiceItem.header.ProformaGstNumber}</td>
      </tr>
    </table>
   
    <table class="table-bordered">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Description</th>
                  <th>Units (Hrs.)</th>
                  <th>Rate (INR)</th>
                  <th>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
             <tr>
              <td>1</td>
              <td class="bold">Charges</td>
              <td class="text-right"></td>
              <td class="text-right"></td>
              <td></td>
            </tr>
                ${invoiceItem.chargesList.map((charge, index) => `
                  <tr>
                   
                     <td class="text-center"></td>
                    <td>${charge.description}</td>
                    <td class="text-center">${charge.units ? charge.units : ''}</td>
                    <td class="text-right">${charge.rate}</td>
                    <td class="text-right">${charge.amount}</td>
                  </tr>
                `).join('')}
               
                <tr>
                <td></td>
                <td></td>
                <td></td>
                  <td  class="text-right bold" style="background-color: rgb(181, 179, 200);">Total</td>
                  <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">${invoiceItem.subtotal}</td>
                </tr>
                <tr>
              <td>2</td>
                    <td class="bold">Taxes:</td>
                    <td></td>
                    <td></td>
                    <td></td>
              </tr>
 
                ${invoiceItem.taxList.map(tax => `
                  <tr>
                    <td></td>
                    <td>${tax.description}</td>
                    <td></td>
                    <td></td>
                    <td class="text-right">${tax.amount}</td>
                  </tr>
                `).join('')}
 
                <tr>
                <td></td>
                <td></td>
                <td></td>
                  <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">Grand Total</td>
                  <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">${invoiceItem.grandTotal}</td>
                </tr>
                 <tr>
                    <td colspan="5" class="bold"> ${invoiceItem.amountInWords}</td>
                 </tr>
              </tbody>
            </table>
   
    <table class="table-bordered">
      <tr>
       
        <th class="bold">Bank Details</th>
        <th class="bold">Booking Details</th>
      </tr>
      <tr>
        <td><strong>Account Name:</strong> RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED<br><strong>Bank:</strong> KOTAK MAHINDRA BANK<br><strong>Account No:</strong> 0745211990<br><strong>Branch:</strong> BANJARAHILLS<br><strong>IFSC Code:</strong> KKBK00007461 (NEFT/RTGS)</td>
       
        <td><strong>Date Of Journey:</strong> ${invoiceItem.header.BookingDateOfJourny}<br>Sector: ${invoiceItem.header.BookingSector}<br>Billing Flying Time: ${invoiceItem.header.BookingBillingFlyingTime} Hrs.</td>
      </tr>
    </table>
   
    <p class="bold">Note:</p>
    <p>${invoiceItem.header.notes}</p>
    <div class="footer">
            <div class="logo"><img src="${this.InvoiceLogo}" alt="Company Logo"></div>
            <div class="text-center">
                <div    > <img src="${this.signature}" alt="Company Logo" class="logo"></div>
                   Authorised Signatory
               
            </div>
        </div>
   
  </div>
</body>
</html>
 
 
    `;
 
    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
 
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };
  generateInvoiceHTML7 (invoiceItem: InvoiceItem) {
 
    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();
    this.signature = this.imageService.getBase64Signature();
    const invoiceHTML = `
   
 
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Invoice</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 10px;
            background-color: white;
        }
 
        .invoice-container {
            width: 100%;
            margin: auto;
            border: 1px solid #ddd;
            padding: 10px;
            background: #fff;
            box-sizing: border-box;
        }
 
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
 
        .logo img {
            max-width: 100px;
            height: auto;
        }
 
        .title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-top: 5px;
            background-color: rgb(107, 101, 156);
            color: white;
            padding: 5px;
        }
 
        .details {
            display: flex;
            justify-content: space-between;
            gap: 10px; /* Removed gap */
            margin-top: 10px;
        }
 
        .details div {
            width: 48%;
            padding: 0px;
            border-radius: 8px;
            margin: 0; /* Ensure no margin */
        }
 
        .details div:first-child {
            background-color: #f8d7da !important;
        }
 
        .details div:last-child {
            background-color: #d4edda !important;
        }
 
 
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
 
        .table, .table th, .table td {
            border: 1px solid black;
            padding: 5px;
            text-align: left;
            font-weight: bold;
        }
 
        .table th {
            background-color: #6200ee !important;
            color: white !important;
            text-align: center;
            font-size: 14px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
 
        .bank-booking {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-top: 10px;
        }
 
        .booking-details {
            width: 48%;
            padding: 10px;
            border-radius: 8px;
            color: #333;
        }
 
        .booking-details:first-child {
            background-color: #cce5ff !important;
        }
 
        .booking-details:last-child {
            background-color: #ffeeba !important;
        }
 
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-top: 10px;
        }
 
        .footer .logo {
            width: 50%;
        }
 
        .footer .logo img {
            width: 100%;
            height: auto;
        }
 
        .paka {
            color: rgb(104, 93, 255);
        }
 .text-right {
      text-align: right !important;
    }
    .text-center {
      text-align: center !important;
    }
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            .invoice-container {
                width: 100%;
                padding: 5px;
            }
            .logo img {
                max-width: 80px;
            }
            .title {
                font-size: 16px;
                padding: 3px;
            }
            .details div {
                padding: 5px;
            }
            .table, .table th, .table td {
                padding: 3px;
            }
            .table th {
                font-size: 12px;
            }
            .bank-booking {
                gap: 5px;
            }
            .booking-details {
                padding: 5px;
            }
            .footer {
                margin-top: 5px;
            }
                 .text-right {
      text-align: right !important;
    }
    .text-center {
      text-align: center !important;
    }
    body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
 
    .title {
        background-color: rgb(144, 163, 203) !important;
        color: white !important;
    }
 
    .details div:first-child {
        background-color: #f8d7da !important;
    }
 
    .details div:last-child {
        background-color: #d4edda !important;
    }
 
    .table th {
        background-color: #6200ee !important;
        color: white !important;
    }
 
    .booking-details:first-child {
        background-color: #cce5ff !important;
    }
 
    .booking-details:last-child {
        background-color: #ffeeba !important;
    }
       
        .footer .logo img {
            width: 100%;
            height: 100%;
        }
}
       
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header-section">
            <div class="paka"><h2>INVOICE NO: ${invoiceItem.invoiceUniqueNumber}</h2></div>
            <div class="logo"><img src="${this.logoUrl}" alt="Invoice Logo"></div>
        </div>
        <div class="title">${invoiceItem.proformaCardHeaderName}</div>
       
        <div class="details">
            <div>
                <p>${invoiceItem.header.ProformaCustomerName}</p>
                <p>${invoiceItem.header.ProformaAddress}</p>
                <p>${invoiceItem.header.ProformaCity}-${invoiceItem.header.ProformaPincode}</p>
                <p><strong>GST NO:</strong> ${invoiceItem.header.ProformaGstNo}</p>
                <p><strong>PAN NO:</strong> ${invoiceItem.header.ProformaPan}</p>
            </div>          
            <div>
                <p><strong>Invoice Date:</strong> ${invoiceItem.header.ProformaInvoiceDate}</p>
                <p><strong>PAN:</strong> ${invoiceItem.header.ProformaPanNO}</p>
                <p><strong>GST NO:</strong> ${invoiceItem.header.ProformaGstNumber}</p>
                <p><strong>TYPE OF AIRCRAFT:</strong> ${invoiceItem.header.ProformaTypeOfAircraft}</p>
                <p><strong>SEATING CAPACITY:</strong> ${invoiceItem.header.ProformaTypeOfAircraft}</p>
            </div>
        </div>
       
        <table class="table">
            <thead>
                <tr>
                    <th>S.No</th>
                    <th>Description</th>
                    <th>Units (Hrs.)</th>
                    <th>Rate (INR)</th>
                    <th>Amount (INR)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td class="bold">Charges</td>
                    <td class="text-right"></td>
                    <td class="text-right"></td>
                    <td></td>
                </tr>
                ${invoiceItem.chargesList.map((charge, index) => `
                    <tr>
                        <td class="text-center"></td>
                        <td>${charge.description}</td>
                        <td class="text-center">${charge.units ? charge.units : ''}</td>
                        <td class="text-right">${charge.rate}</td>
                        <td class="text-right">${charge.amount}</td>
                    </tr>
                `).join('')}
               
                <tr>
                    <td colspan="3"></td>
                    <td class="text-right bold">Total</td>
                    <td class="text-right bold">${invoiceItem.subtotal}</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td class="bold">Taxes:</td>
                    <td colspan="3"></td>
                </tr>
                ${invoiceItem.taxList.map(tax => `
                    <tr>
                        <td></td>
                        <td>${tax.description}</td>
                        <td colspan="2"></td>
                        <td class="text-right">${tax.amount}</td>
                    </tr>
                `).join('')}
                <tr>
                    <td colspan="3"></td>
                    <td class="text-right bold">Grand Total</td>
                    <td class="text-right bold">${invoiceItem.grandTotal}</td>
                </tr>
                <tr>
                  <td colspan="5" class="bold"> ${invoiceItem.amountInWords}</td>
                </tr>
            </tbody>
        </table>
       
       
        <div class="bank-booking">
            <div class="booking-details">
                <strong>BANK DETAILS</strong><br>
                <strong>ACCOUNT NAME:</strong> RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED<br>
                <strong>BANK:</strong> KOTAK MAHINDRA BANK<br>
                <strong>ACCOUNT NO:</strong> 0745211990<br>
                <strong>BRANCH:</strong> BANJARAHILLS<br>
                <strong>IFSC CODE:</strong> KKBK00007461 (NEFT/RTGS)<br>
            </div>
            <div class="booking-details">
                <strong>BOOKING DETAILS</strong>
      <p><strong>Date Of Journey:</strong> ${invoiceItem.header.BookingDateOfJourny}</p>
      <p><strong>SECTOR:</strong> ${invoiceItem.header.BookingSector}</p>
      <p><strong>BILLING FLYING TIME:</strong> ${invoiceItem.header.BookingBillingFlyingTime} Hrs.</p>
            </div>
        </div>
         <p class="bold">Note:</p>
    <p>${invoiceItem.header.notes}</p>
        <div class="footer">
            <div class="logo"><img src="${this.InvoiceLogo}" alt="Company Logo"></div>
            <div class="text-center">
                <div    > <img src="${this.signature}" alt="Company Logo" class="logo"></div>
                   Authorised Signatory
               
            </div>
        </div>
    </div>
</body>
</html>
 
 
    `;
 
    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
 
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };
 
  generateInvoiceHTML8 (invoiceItem: InvoiceItem) {
 
    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();
    this.signature = this.imageService.getBase64Signature();
    const invoiceHTML = `
    // <!DOCTYPE html>
<html>
<head>
 
  <style>
      .invoice-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  background: #fff;
  font-family: Arial, sans-serif;
}
   body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 5px;
              background-color: white;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-size: 12px;
            }
          .invoice-container {
            width: 100%;
            margin: auto;
            border: 1px solid #ddd;
            padding: 10px;
            background: #fff;
            box-sizing: border-box;
        }
 
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    .header-section .logo {
      width: 50%;
      text-align: center;
    }
    .header-section img {
      max-width: 100%;
      height: auto;
    }
       .logo img {
            max-width: 100px;
            height: auto;
        }
    .orange-background{
      background-color: rgb(107, 101, 156);
      color: white;
      padding: 8px;
      text-align: center;
      font-weight: bold;
    }
    .table-bordered {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 10px;
      // background-color:rgb(193, 205, 217); /* Added background color */
    }
   .table-bordered td, .table-bordered th {
      border: 1px solid black;
      padding: 2px;
    }
 
  .table-bordered th {
      background-color: rgb(79, 58, 238);
      color:white
    }
   
 
   
       
    .bold {
      font-weight: bold;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
   .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-top: 10px;
        }
 
        .footer .logo {
            width: 50%;
        }
 
        .footer .logo img {
            width: 100%;
            height: auto;
        }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header-section">
      <div class="logo"><h3>${invoiceItem.proformaCardHeaderName}</h3></div>
      <div class="logo"><img src="${this.logoUrl}" alt="Invoice Logo"></div>
    </div>
   
    <table class="table-bordered">
      <tr>
        <th class="bold">TO</th>
        <th class="bold">FROM</th>
      </tr>
      <tr>
        <td>${invoiceItem.header.ProformaCustomerName}<br>${invoiceItem.header.ProformaAddress}<br>${invoiceItem.header.ProformaCity}<br>${invoiceItem.header.ProformaPincode} <br><strong>GST NO:</strong> ${invoiceItem.header.ProformaGstNo}<br>
                <strong>PAN NO:</strong> ${invoiceItem.header.ProformaPan}</td>
        <td>INVOICE NO: ${invoiceItem.invoiceUniqueNumber}<br>DATE: ${invoiceItem.header.ProformaInvoiceDate}<br>PAN: ${invoiceItem.header.ProformaPanNO}<br>GST NO: ${invoiceItem.header.ProformaGstNumber}</td>
      </tr>
    </table>
   
    <table class="table-bordered">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Description</th>
                  <th>Units (Hrs.)</th>
                  <th>Rate (INR)</th>
                  <th>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
             <tr>
              <td>1</td>
              <td class="bold">Charges</td>
              <td class="text-right"></td>
              <td class="text-right"></td>
              <td></td>
            </tr>
                ${invoiceItem.chargesList.map((charge, index) => `
                  <tr>
                   
                     <td class="text-center"></td>
                    <td>${charge.description}</td>
                    <td class="text-center">${charge.units ? charge.units : ''}</td>
                    <td class="text-right">${charge.rate}</td>
                    <td class="text-right">${charge.amount}</td>
                  </tr>
                `).join('')}
               
                <tr>
                  <td colspan="4" class="text-right bold">Total</td>
                  <td class="text-right bold">${invoiceItem.subtotal}</td>
                </tr>
                <tr>
              <td>2</td>
                    <td class="bold">Taxes:</td>
                    <td></td>
                    <td></td>
                    <td></td>
              </tr>
 
                ${invoiceItem.taxList.map(tax => `
                  <tr>
                    <td></td>
                    <td>${tax.description}</td>
                    <td></td>
                    <td></td>
                    <td class="text-right">${tax.amount}</td>
                  </tr>
                `).join('')}
 
                <tr>
                  <td colspan="4" class="text-right bold">Grand Total</td>
                  <td class="text-right bold">${invoiceItem.grandTotal}</td>
                </tr>
                <tr>
                  <td colspan="5" class="bold"> ${invoiceItem.amountInWords}</td>
                </tr>
              </tbody>
            </table>
   
    <table class="table-bordered">
      <tr>
        <th class="bold">Booking Details</th>
        <th class="bold">Bank Details</th>
      </tr>
      <tr>
        <td>Date Of Journey: ${invoiceItem.header.BookingDateOfJourny}<br>Sector: ${invoiceItem.header.BookingSector}<br>Billing Flying Time: ${invoiceItem.header.BookingBillingFlyingTime} Hrs.</td>
        <td>Account Name: RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED<br>Bank: KOTAK MAHINDRA BANK<br>Account No: 0745211990<br>Branch: BANJARAHILLS<br>IFSC Code: KKBK00007461 (NEFT/RTGS)</td>
      </tr>
    </table>
   
    <p class="bold">Note:</p>
    <p>${invoiceItem.header.notes}</p>
    <div class="footer">
            <div class="logo"><img src="${this.InvoiceLogo}" alt="Company Logo"></div>
            <div class="text-center">
                <div    > <img src="${this.signature}" alt="Company Logo" class="logo"></div>
                   Authorised Signatory
               
            </div>
        </div>
   
  </div>
</body>
</html>
 
 
    `;
 
    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
 
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };
  generateInvoiceHTML9 (invoiceItem: InvoiceItem) {
 
    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();
    this.signature = this.imageService.getBase64Signature();
    const invoiceHTML = `
    // <!DOCTYPE html>
<html>
<head>
 
  <style>
      .invoice-container {
          max-width: 800px;
          margin: auto;
          padding: 10px;
          border: 1px solid #ccc;
          background: #fff;
          font-family: Arial, sans-serif;
      }
 
      body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 5px;
          background-color: white;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          font-size: 12px;
      }
 
      .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color:#d9e4ff 
      }
 
      .header-section .logo {
          width: 50%;
          text-align: center;
      }
 
      .header-section img {
          max-width: 100%;
          height: auto;
      }
 
      .logo img {
          max-width: 100px;
          height: auto;
      }
 
      .orange-background {
          background-color: rgb(55, 124, 229);
          color: white;
          padding: 5px;
          text-align: center;
          font-weight: bold;
      }
 
      /* Table Styles */
      .table-bordered {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 5px;
      }
 
      .table-bordered th {
          border: 1px solid black;
          background-color: #d9e4ff ;
          color:black;
          padding: 6px;
          text-align: center;
      }
 
      .table-bordered td {
          padding: 3px;
      }
 
      .bold {
          font-weight: bold;
      }
 
      .text-right {
          text-align: right;
      }
 
      .text-center {
          text-align: center;
      }
 
      .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-top: 5px;
      }
 
      .footer .logo {
          width: 50%;
      }
 
      .footer .logo img {
          width: 100%;
          height: auto;
      }
          @media print{
          .table-bordered th {
          border: 1px solid black;
          background-color: #d9e4ff; 
          color:black;
          padding: 6px;
          text-align: center;
          }
          }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header-section">
      <div class="logo"><h3>INVOICE NO: ${invoiceItem.invoiceUniqueNumber}</h3></div>
      <div class="logo"><img src="${this.logoUrl}" alt="Invoice Logo"></div>
    </div>
    <div class="orange-background">${invoiceItem.proformaCardHeaderName}</div>
    <br>
   
    <table class="table-bordered">
      <tr>
        <th class="bold">TO</th>
        <th class="bold">FROM</th>
      </tr>
      <tr>
        <td>${invoiceItem.header.ProformaCustomerName}<br>${invoiceItem.header.ProformaAddress}<br>${invoiceItem.header.ProformaCity}-${invoiceItem.header.ProformaPincode} <br><strong>GST NO:</strong>${invoiceItem.header.ProformaGstNo}<br>
                <strong>PAN NO:</strong> ${invoiceItem.header.ProformaPan}</td>
        <td><strong>INVOICE NO:</strong> ${invoiceItem.invoiceUniqueNumber}<br><strong>DATE:</strong> ${invoiceItem.header.ProformaInvoiceDate}<br><strong>PAN:</strong> ${invoiceItem.header.ProformaPanNO}<br><strong>GST NO:</strong> ${invoiceItem.header.ProformaGstNumber}</td>
      </tr>
    </table>
   
    
   
    <table class="table-bordered">
      <tr>
      <th class="bold">Bank Details</th>
        <th class="bold">Booking Details</th>
       
      </tr>
      <tr>
              <td><strong>Account Name:</strong> RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED<br><strong>Bank:</strong> KOTAK MAHINDRA BANK<br><strong>Account No:</strong> 0745211990<br><strong>Branch:</strong> BANJARAHILLS<br><strong>IFSC Code:</strong> KKBK00007461 (NEFT/RTGS)</td>
        <td><strong>Date Of Journey:</strong> ${invoiceItem.header.BookingDateOfJourny}<br><strong>Sector</strong>: ${invoiceItem.header.BookingSector}<br><strong>Billing Flying Time:<strong> ${invoiceItem.header.BookingBillingFlyingTime} Hrs.</td>
      </tr>
    </table>
    <table class="table-bordered">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Description</th>
          <th>Units (Hrs.)</th>
          <th>Rate (INR)</th>
          <th>Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td class="bold">Charges</td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td></td>
        </tr>
        ${invoiceItem.chargesList.map((charge, index) => `
          <tr>
            <td class="text-center"></td>
            <td>${charge.description}</td>
            <td class="text-center">${charge.units ? charge.units : ''}</td>
            <td class="text-right">${charge.rate}</td>
            <td class="text-right">${charge.amount}</td>
          </tr>
        `).join('')}
       
        <tr>
          <td colspan="4" class="text-right bold">Total</td>
          <td class="text-right bold">${invoiceItem.subtotal}</td>
        </tr>
        <tr>
          <td>2</td>
          <td class="bold">Taxes:</td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
 
        ${invoiceItem.taxList.map(tax => `
          <tr>
            <td></td>
            <td>${tax.description}</td>
            <td></td>
            <td></td>
            <td class="text-right">${tax.amount}</td>
          </tr>
        `).join('')}
 
        <tr>
          <td colspan="4" class="text-right bold">Grand Total</td>
          <td class="text-right bold">${invoiceItem.grandTotal}</td>
        </tr>
        <tr>
            <td colspan="5" class="bold"> ${invoiceItem.amountInWords}</td>
        </tr>
      </tbody>
    </table>
    <p class="bold">Note:</p>
    <p>${invoiceItem.header.notes}</p>
    <div class="footer">
      <div class="logo"><img src="${this.InvoiceLogo}" alt="Company Logo"></div>
      <div class="text-center">
        <div><img src="${this.signature}" alt="Company Logo" class="logo"></div>
        Authorised Signatory
      </div>
    </div>
  </div>
</body>
</html>
 
 
 
    `;
 
    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
 
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };
  generateInvoiceHTMLFix1 (invoiceItem: InvoiceItem) {
 
    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();
    this.signature = this.imageService.getBase64Signature();
    const invoiceHTML = `
    // <!DOCTYPE html>
<html>
<head>
 
  <style>
      .invoice-container {
  margin: 10px;
  padding: 20px;
  border: 1px solid #ccc;
  background: #fff;
  font-family: Arial, sans-serif;
}
   body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 5px;
              background-color: white;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-size: 12px;
            }
       
          .invoice-container {
            width: 100%;
            margin: auto;
            border: 1px solid #ddd;
            padding: 10px;
            background: #fff;
            box-sizing: border-box;
        }
 
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
 .header-section {
    display: flex;
    align-items: center;
    justify-content: space-between; /* Distributes space evenly */
}

.header-section .logo {
    display: flex;
    flex-direction: column;
    align-items: center; /* Center content vertically */
}

.header-section .left-logo {
    text-align: left; /* Align text to the left */
}

.header-section .right-logo {
    text-align: right; /* Align text to the right */
}

.header-section .company-name {
    text-align: center; /* Center the company name */
    flex-grow: 1; /* Allow the company name to take up available space */
}

.header-section img {
    max-width: 100px; /* Adjust as needed */
    height: auto;
}
   .booking-details {
      border: 1px solid #ccc;
      width: 100%;
    }

    .booking-header {
      background-color: rgb(91, 85, 130);
      padding: 5px;
      color:white;
        text-align: center;
      border-bottom: 1px solid #ccc;
    }

    .booking-data {
          padding: 5px;
    width: 100%;
    display: flex;
    font-size: 14px;
    }

    .data-item {
      display: inline-block;
      padding-right: 10px;
      border-right: 1px solid #ccc;
    }

    .data-item:last-child {
      border-right: none;
      padding-right: 0;
    }
     .text-center{
       text-align: right;
      }
    .orange-background {
   
      background-color: rgb(181, 179, 200);
      font-size: 15px;
      color:white;
      padding: 8px;
      text-align: center;
      font-weight: bold;
    }
    .table-bordered {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 10px;
      // background-color:rgb(193, 205, 217); /* Added background color */
    }
     .table-bordered th {
        border: 1px solid white;
    padding: 2px;
    background: rgb(88 98 145) !important;
    color: white;
    }
 
    .table-bordered td {
    padding: 2px;
    }
   
 
   
       
    .bold {
      font-weight: bold;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
   .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-top: 10px;
        }
 
        .footer .logo {
            width: 50%;
        }
 
        .footer .logo img {
            width: 100%;
            height: auto;
        }
     
  

 

  @media print {
    .invoice-container {
  margin: 5px;
  padding: 5px;
  border: 1px solid #ccc;
  background: #fff;
  font-family: Arial, sans-serif;
}
   body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 5px;
              background-color: white;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-size: 12px;
            }
       
          .invoice-container {
            width: 100%;
            margin: auto;
            border: 1px solid #ddd;
            padding: 10px;
            background: #fff;
            box-sizing: border-box;
        }
 
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
 .header-section {
    display: flex;
    align-items: center;
    justify-content: space-between; /* Distributes space evenly */
}

.header-section .logo {
    display: flex;
    flex-direction: column;
    align-items: center; /* Center content vertically */
}

.header-section .left-logo {
    text-align: left; /* Align text to the left */
}

.header-section .right-logo {
    text-align: right; /* Align text to the right */
}

.header-section .company-name {
    text-align: center; /* Center the company name */
    flex-grow: 1; /* Allow the company name to take up available space */
}

.header-section img {
    max-width: 100px; /* Adjust as needed */
    height: auto;
}
   .booking-details {
      border: 1px solid #ccc;
      width: 100%;
    }

    .booking-header {
      background-color: rgb(91, 85, 130);
      padding: 5px;
      color:white;
        text-align: center;
      border-bottom: 1px solid #ccc;
    }

    .booking-data {
          padding: 5px;
    width: 100%;
    display: flex;
    font-size: 14px;
    }

    .data-item {
      display: inline-block;
      padding-right: 10px;
      border-right: 1px solid #ccc;
    }

    .data-item:last-child {
      border-right: none;
      padding-right: 0;
    }
     .text-center{
       text-align: right;
      }
    .orange-background {
   
      background-color: rgb(181, 179, 200);
      font-size: 15px;
      color:white;
      padding: 8px;
      text-align: center;
      font-weight: bold;
    }
    .table-bordered {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 10px;
      // background-color:rgb(193, 205, 217); /* Added background color */
    }
     .table-bordered th {
        border: 1px solid white;
    padding: 2px;
    background: rgb(88 98 145) !important;
    color: white;
    }
 
    .table-bordered td {
    padding: 2px;
    }
   
 
   
       
    .bold {
      font-weight: bold;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
   .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-top: 10px;
        }
 
        .footer .logo {
            width: 50%;
        }
 
        .footer .logo img {
            width: 100%;
            height: auto;
        }


  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header-section">
           <div class="logo left-logo"><img src="${this.logoUrl}" alt="Invoice Logo"></div>
      <div class="logo"><h3>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h3></div>
            <div class="logo right-logo"><img src="${this.InvoiceLogo}" alt="Company Logo"></div>
    </div>
    <div class="orange-background">${invoiceItem.proformaCardHeaderName}</div>
    <br>
   
    <table class="table-bordered">
      <tr>
        <th class="bold">TO</th>
        <th class="bold">FROM</th>
      </tr>
      <tr>
        <td>${invoiceItem.header.ProformaCustomerName}<br>${invoiceItem.header.ProformaAddress}<br>${invoiceItem.header.ProformaCity}<br>${invoiceItem.header.ProformaPincode} <br><strong>GST NO:</strong>${invoiceItem.header.ProformaGstNo}<br>
                <strong>PAN NO:</strong> ${invoiceItem.header.ProformaPan}</td>
        <td><strong>INVOICE NO:</strong> ${invoiceItem.invoiceUniqueNumber}<br<strong>DATE: </strong>${invoiceItem.header.ProformaInvoiceDate}<br><strong>PAN NO</strong>: ${invoiceItem.header.ProformaPanNO}<br><strong>GST NO: </strong>${invoiceItem.header.ProformaGstNumber}</td>
      </tr>
    </table>
  
    <div class="booking-details">
  <div class="booking-header bold">Booking Details</div>
  <div class="booking-data single-line">
      <div style="width:35%; text-align: center;" ><div class="bold">Date Of Journey</div> <div>03/03/25-04/03/2025</div></div>
      <div style="width:35%; text-align: center;" ><div class="bold">Sector</div> <div>${invoiceItem.header.BookingSector}</div></div>
      <div style="width:30%; text-align: center;" ><div class="bold">Billing Flying Time</div> <div>${invoiceItem.header.BookingBillingFlyingTime}</div></div>
 </div>
 </div>

    <table class="table-bordered">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Description</th>
                  <th>Units (Hrs.)</th>
                  <th>Rate (INR)</th>
                  <th>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
             <tr>
              <td>1</td>
              <td class="bold">Charges</td>
              <td class="text-right"></td>
              <td class="text-right"></td>
              <td></td>
            </tr>
                ${invoiceItem.chargesList.map((charge, index) => `
                  <tr>
                   
                     <td class="text-center"></td>
                    <td>${charge.description}</td>
                    <td class="text-center">${charge.units ? charge.units : ''}</td>
                    <td class="text-right">${charge.rate}</td>
                    <td class="text-right">${charge.amount}</td>
                  </tr>
                `).join('')}
               
                <tr>
                <td></td>
                <td></td>
                <td></td>
                  <td  class="text-right bold" style="background-color: rgb(181, 179, 200);">Total</td>
                  <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">${invoiceItem.subtotal}</td>
                </tr>
                <tr>
              <td>2</td>
                    <td class="bold">Taxes:</td>
                    <td></td>
                    <td></td>
                    <td></td>
              </tr>
 
                ${invoiceItem.taxList.map(tax => `
                  <tr>
                    <td></td>
                    <td>${tax.description}</td>
                    <td></td>
                    <td></td>
                    <td class="text-right">${tax.amount}</td>
                  </tr>
                `).join('')}
 
                <tr>
                <td></td>
                <td></td>
                <td></td>
                  <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">Grand Total</td>
                  <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">${invoiceItem.grandTotal}</td>
                </tr>
                 <tr>
                    <td colspan="5" class="bold"> ${invoiceItem.amountInWords}</td>
                 </tr>
              </tbody>
            </table>
   
    <table class="table-bordered">
      <tr>
       
        <th class="bold">Bank Details</th>
      
      </tr>
      <tr>
        <td><strong>Account Name:</strong> RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED<br><strong>Bank:</strong> KOTAK MAHINDRA BANK<br><strong>Account No:</strong> 0745211990<br><strong>Branch:</strong> BANJARAHILLS<br><strong>IFSC Code:</strong> KKBK00007461 (NEFT/RTGS)</td>
       
      </tr>
    </table>
   
 
    <div class="footer">
            <div class="logo"> <p class="bold">Note:</p>
    <p>${invoiceItem.header.notes}</p>
    </div>
            <div class="text-center">
                <div  > <img src="${this.signature}" alt="Company Logo" class="logo"></div>
                   Authorised Signatory
               
            </div>
        </div>
   
  </div>
</body>
</html>
 
 
    `;
 
    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
 
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };
  generateInvoiceHTMLFix2 (invoiceItem: InvoiceItem) {
 
    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();
    this.signature = this.imageService.getBase64Signature();
    const invoiceHTML = `
    // <!DOCTYPE html>
<html>
<head>
 
  <style>
      .invoice-container {
  margin: 10px;
  padding: 20px;
  border: 1px solid #ccc;
  background: #fff;
  font-family: Arial, sans-serif;
}
   body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 5px;
              background-color: white;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-size: 12px;
            }
       
          .invoice-container {
            width: 100%;
            margin: auto;
            border: 1px solid #ddd;
            padding: 10px;
            background: #fff;
            box-sizing: border-box;
        }
 
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
 .header-section {
    display: flex;
    align-items: center;
    justify-content: space-between; /* Distributes space evenly */
}

.header-section .logo {
    display: flex;
    flex-direction: column;
    align-items: center; /* Center content vertically */
}

.header-section .left-logo {
    text-align: left; /* Align text to the left */
}

.header-section .right-logo {
    text-align: right; /* Align text to the right */
}

.header-section .company-name {
    text-align: center; /* Center the company name */
    flex-grow: 1; /* Allow the company name to take up available space */
}

.header-section img {
    max-width: 100px; /* Adjust as needed */
    height: auto;
}
   .booking-details {
      border: 1px solid #ccc;
      width: 100%;
    }

    .booking-header {
      background-color: rgb(91, 85, 130);
      padding: 5px;
      color:white;
        text-align: center;
      border-bottom: 1px solid #ccc;
    }

    .booking-data {
          padding: 5px;
    width: 100%;
    display: flex;
    font-size: 14px;
    }

    .data-item {
      display: inline-block;
      padding-right: 10px;
      border-right: 1px solid #ccc;
    }

    .data-item:last-child {
      border-right: none;
      padding-right: 0;
    }
     .text-center{
       text-align: right;
      }
    .orange-background {
   
      background-color: rgb(181, 179, 200);
      font-size: 15px;
      color:white;
      padding: 8px;
      text-align: center;
      font-weight: bold;
    }
    .table-bordered {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 10px;
      // background-color:rgb(193, 205, 217); /* Added background color */
    }
     .table-bordered th {
        border: 1px solid white;
    padding: 2px;
    background: rgb(88 98 145) !important;
    color: white;
    }
 
    .table-bordered td {
    padding: 2px;
    }
   
 
   
       
    .bold {
      font-weight: bold;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
   .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-top: 10px;
        }
 
        .footer .logo {
            width: 50%;
        }
 
        .footer .logo img {
            width: 100%;
            height: auto;
        }
     
  

 

  @media print {
    .invoice-container {
  margin: 5px;
  padding: 5px;
  border: 1px solid #ccc;
  background: #fff;
  font-family: Arial, sans-serif;
}
   body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 5px;
              background-color: white;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-size: 12px;
            }
       
          .invoice-container {
            width: 100%;
            margin: auto;
            border: 1px solid #ddd;
            padding: 10px;
            background: #fff;
            box-sizing: border-box;
        }
 
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
 .header-section {
    display: flex;
    align-items: center;
    justify-content: space-between; /* Distributes space evenly */
}

.header-section .logo {
    display: flex;
    flex-direction: column;
    align-items: center; /* Center content vertically */
}

.header-section .left-logo {
    text-align: left; /* Align text to the left */
}

.header-section .right-logo {
    text-align: right; /* Align text to the right */
}

.header-section .company-name {
    text-align: center; /* Center the company name */
    flex-grow: 1; /* Allow the company name to take up available space */
}

.header-section img {
    max-width: 100px; /* Adjust as needed */
    height: auto;
}
   .booking-details {
      border: 1px solid #ccc;
      width: 100%;
    }

    .booking-header {
      background-color: rgb(91, 85, 130);
      padding: 5px;
      color:white;
        text-align: center;
      border-bottom: 1px solid #ccc;
    }

    .booking-data {
          padding: 5px;
    width: 100%;
    display: flex;
    font-size: 14px;
    }

    .data-item {
      display: inline-block;
      padding-right: 10px;
      border-right: 1px solid #ccc;
    }

    .data-item:last-child {
      border-right: none;
      padding-right: 0;
    }
     .text-center{
       text-align: right;
      }
    .orange-background {
   
      background-color: rgb(181, 179, 200);
      font-size: 15px;
      color:white;
      padding: 8px;
      text-align: center;
      font-weight: bold;
    }
    .table-bordered {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 10px;
      // background-color:rgb(193, 205, 217); /* Added background color */
    }
     .table-bordered th {
        border: 1px solid white;
    padding: 2px;
    background: rgb(88 98 145) !important;
    color: white;
    }
 
    .table-bordered td {
    padding: 2px;
    }
   
 
   
       
    .bold {
      font-weight: bold;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
   .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-top: 10px;
        }
 
        .footer .logo {
            width: 50%;
        }
 
        .footer .logo img {
            width: 100%;
            height: auto;
        }


  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header-section">
            <div class="logo right-logo"><img src="${this.InvoiceLogo}" alt="Company Logo"></div>
      <div class="logo"><h3>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h3></div>
                       <div class="logo left-logo"><img src="${this.logoUrl}" alt="Invoice Logo"></div>

    </div>
    <div class="orange-background">${invoiceItem.proformaCardHeaderName}</div>
    <br>
   
    <table class="table-bordered">
      <tr>
        <th class="bold">TO</th>
        <th class="bold">FROM</th>
      </tr>
      <tr>
        <td>${invoiceItem.header.ProformaCustomerName}<br>${invoiceItem.header.ProformaAddress}<br>${invoiceItem.header.ProformaCity}<br>${invoiceItem.header.ProformaPincode} <br><strong>GST NO:</strong>${invoiceItem.header.ProformaGstNo}<br>
                <strong>PAN NO:</strong> ${invoiceItem.header.ProformaPan}</td>
        <td><strong>INVOICE NO:</strong> ${invoiceItem.invoiceUniqueNumber}<br<strong>DATE: </strong>${invoiceItem.header.ProformaInvoiceDate}<br><strong>PAN NO</strong>: ${invoiceItem.header.ProformaPanNO}<br><strong>GST NO: </strong>${invoiceItem.header.ProformaGstNumber}</td>
      </tr>
    </table>
  
    <div class="booking-details">
  <div class="booking-header bold">Booking Details</div>
  <div class="booking-data single-line">
      <div style="width:35%; text-align: center;" ><div class="bold">Date Of Journey</div> <div>03/03/25-04/03/2025</div></div>
      <div style="width:35%; text-align: center;" ><div class="bold">Sector</div> <div>${invoiceItem.header.BookingSector}</div></div>
      <div style="width:30%; text-align: center;" ><div class="bold">Billing Flying Time</div> <div>${invoiceItem.header.BookingBillingFlyingTime}</div></div>
 </div>
 </div>

    <table class="table-bordered">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Description</th>
                  <th>Units (Hrs.)</th>
                  <th>Rate (INR)</th>
                  <th>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
             <tr>
              <td>1</td>
              <td class="bold">Charges</td>
              <td class="text-right"></td>
              <td class="text-right"></td>
              <td></td>
            </tr>
                ${invoiceItem.chargesList.map((charge, index) => `
                  <tr>
                   
                     <td class="text-center"></td>
                    <td>${charge.description}</td>
                    <td class="text-center">${charge.units ? charge.units : ''}</td>
                    <td class="text-right">${charge.rate}</td>
                    <td class="text-right">${charge.amount}</td>
                  </tr>
                `).join('')}
               
                <tr>
                <td></td>
                <td></td>
                <td></td>
                  <td  class="text-right bold" style="background-color: rgb(181, 179, 200);">Total</td>
                  <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">${invoiceItem.subtotal}</td>
                </tr>
                <tr>
              <td>2</td>
                    <td class="bold">Taxes:</td>
                    <td></td>
                    <td></td>
                    <td></td>
              </tr>
 
                ${invoiceItem.taxList.map(tax => `
                  <tr>
                    <td></td>
                    <td>${tax.description}</td>
                    <td></td>
                    <td></td>
                    <td class="text-right">${tax.amount}</td>
                  </tr>
                `).join('')}
 
                <tr>
                <td></td>
                <td></td>
                <td></td>
                  <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">Grand Total</td>
                  <td class="text-right bold"  style="background-color: rgb(181, 179, 200);">${invoiceItem.grandTotal}</td>
                </tr>
                 <tr>
                    <td colspan="5" class="bold"> ${invoiceItem.amountInWords}</td>
                 </tr>
              </tbody>
            </table>
   
    <table class="table-bordered">
      <tr>
       
        <th class="bold">Bank Details</th>
      
      </tr>
      <tr>
        <td><strong>Account Name:</strong> RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED<br><strong>Bank:</strong> KOTAK MAHINDRA BANK<br><strong>Account No:</strong> 0745211990<br><strong>Branch:</strong> BANJARAHILLS<br><strong>IFSC Code:</strong> KKBK00007461 (NEFT/RTGS)</td>
       
      </tr>
    </table>
   
 
    <div class="footer">
            <div class="logo"> <p class="bold">Note:</p>
    <p>${invoiceItem.header.notes}</p>
    </div>
            <div class="text-center">
                <div  > <img src="${this.signature}" alt="Company Logo" class="logo"></div>
                   Authorised Signatory
               
            </div>
        </div>
   
  </div>
</body>
</html>
 
    `;
 
    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
 
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };
  generateInvoiceHTMLTax1 (invoiceItem: InvoiceItem) {
 
    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();
    this.signature = this.imageService.getBase64Signature();
    const invoiceHTML = `

<html>
<head>
  
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .invoice-container { width: 80%; margin: auto; background-color: white; padding: 20px; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
        
           .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
      .orange-background {   
      background-color: rgb(181, 179, 200);
      font-size: 15px;
      color:white;
      padding: 8px;
      text-align: center;
      font-weight: bold;
    }
      /* Booking Details Container */
.booking-details {
    border: 1px solid rgb(165, 178, 191); /* Blue border */
    padding: 8px;
    margin-bottom: 10px; /* Reduce space */
    background-color: #e6f2ff; /* Light blue background */
    border-radius: 5px;
}

/* Booking Header */
.booking-header {
  
    padding: 6px;
    text-align: center;
    font-weight: bold;
    font-size: 14px;
    border-radius: 3px;
}

/* Booking Data Layout - Column Wise */
.booking-data {
    display: flex;
    flex-direction: column; /* Stack items in a column */
     /* Space between rows */
    padding: 6px;
    font-size: 12px; /* Reduce font size */
}

/* Individual Booking Items */
.booking-data div {
    padding: 5px;
    border-bottom: 0px solid #ccc; /* Line separator */

    color: #333;
}

/* Remove border for the last item */
.booking-data div:last-child {
    border-bottom: none;
}

 .header-section {
    display: flex;
    align-items: center;
    justify-content: space-between; /* Distributes space evenly */
}

.header-section .logo {
    display: flex;
    flex-direction: column;
    align-items: center; /* Center content vertically */
}

.header-section .left-logo {
    text-align: left; /* Align text to the left */
}

.header-section .right-logo {
    text-align: right; /* Align text to the right */
}

.header-section .company-name {
    text-align: center; /* Center the company name */
    flex-grow: 1; /* Allow the company name to take up available space */
}

.header-section img {
    max-width: 100px; /* Adjust as needed */
    height: auto;
}
    .billing-shipping-container {
    display: flex;
    justify-content: space-between;
  
    margin-bottom: 5px;
}

.billing-box, .shipping-box {
    width: 48%; /* Adjusted width to allow for left alignment */
    border: 0px solid #000;
    padding: 5px;
    font-size: 10px;
    background-color: #fff;
    display: flex; /* Added flexbox to align content */
    flex-direction: column; /* Stack header and content vertically */
}

.billing-header, .shipping-header {
    background-color: #000; /* Black background */
    color: #fff; /* White text */
    padding: 3px;
    font-weight: bold;
    text-align: left; /* Aligned header text to the left */
    border-bottom: 1px solid #000;
    font-size: 14px;
    width:100%; /*make header full width*/
}

.billing-content, .shipping-content {
    padding: 5px;
    font-size: 14px;
    text-align: left; /* Align content to the left */
    justify-content: space-around;
}

.billing-box {
    text-align: left; /* Redundant, but ensures left alignment */
}

.shipping-box {
    text-align: left;/*align content to the left*/
}

.shipping-content p {
    margin: 0; /* Remove default paragraph margins */
}

.billing-content p {
    margin: 0; /* Remove default paragraph margins */
}

        /* Table and Booking Details */
        .table-bordered { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table-bordered th, .table-bordered td { padding: 8px; text-align: left; border: 1px solid #ddd; }
        .table-bordered th { background-color: #f0f0f0; font-weight: bold; }
        .booking-details { border: 1px solid #ddd; padding: 10px; margin-bottom: 20px; }
        .booking-header { background-color: #e0e0e0; padding: 5px; text-align: center; font-weight: bold; }
        .booking-data { display: flex; justify-content: space-around; padding: 10px; }

        /* Footer Section */
        .footer { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; }
        .footer-notes { width: 60%; }
        .footer-signature { width: 35%; text-align: center; }
        .footer-signature img { max-width: 150px; height: auto; margin-bottom: 10px; }

        /* Print Media Adjustments */
    @media print {
    @page {
        size: A4; /* Ensure it fits within A4 size */
        margin: 10mm; /* Adjust margin for better fit */
    }

    body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact; /* Ensure colors are printed */
    }

    .invoice-container {
        width: 100%;
        padding: 5px;
        border: 1px solid black;
        box-shadow: none;
        transform: scale(0.9); /* Reduce content size */
        page-break-inside: avoid; /* Prevent breaking inside invoice */
    }

    /* Avoid Page Breaks in Critical Sections */
    .header-section,
    .billing-shipping-container,
    .table-bordered,
    .booking-details,
    .footer {
        page-break-inside: avoid; /* Prevent sections from breaking in the middle */
    }
        
.billing-content, .shipping-content {
    padding: 5px;
    font-size: 14px;
    text-align: left; /* Align content to the left */
    justify-content: space-around;
}

    /* Reduce Font Size for Better Fit */
    .table-bordered th,
    .table-bordered td,
    .booking-data div,
    .billing-content p,
    .shipping-content p {
        font-size: 10px !important; /* Reduce font size */
    }

    /* Optimize Table Layout */
    .table-bordered {
        width: 100%;
        border: 1px solid black;
    }

    .table-bordered th {
        background-color:rgb(58, 168, 144)!important;
        color: white !important;
        -webkit-print-color-adjust: exact;
        font-size: 11px !important;
    }

    .grand-total,.total-row {
        background-color: #f0f0f0 !important;
        -webkit-print-color-adjust: exact;
    }

    /* Adjust Signature Section */
    .footer-signature img {
        max-width: 100px; /* Reduce signature image size */
    }

    /* Adjust Billing & Shipping Layout */
   .billing-shipping-container {
        display: flex;
        justify-content: space-between;
        gap: 20px; /* Adds space between TO and FROM */
        margin-bottom: 10px; /* Adds space below the section */
    }

    .billing-box, .shipping-box {
        width: 48%; /* Ensures proper alignment */
        padding: 10px;
        font-size: 16px !important; /* Increases font size */
    }

    .billing-header, .shipping-header {
        background-image: linear-gradient(to right, #7e22ce, #2563eb);
        color: white;
        padding: 5px;
        font-weight: bold;
        font-size: 18px !important; /* Increases header font size */
        width: 100%;
        text-align: left;
    }

    .billing-content, .shipping-content {
        font-size: 16px !important; /* Increase content font size */
        line-height: 1.8; /* Increases space between lines */
        padding: 10px;
    }

    /* Header Layout */
    .header-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header-section img {
        max-width: 80px; /* Reduce logo size */
        height: auto;
    }

    /* Reduce Space in Booking Details */
    .booking-details {
        width: 50%;
        border: 1px solid #ccc;
        padding: 5px;
        font-size: 10px;
    }   .booking-details {
        background: none !important; /* Ensures no background */
    }
      

    .booking-header {
background-image: linear-gradient(to right, #7e22ce, #2563eb);
        color: white;
        font-weight: bold;
        font-size: 15px;
    }

    .booking-data {
        font-size: 12px;
    }

    .booking-data div {
        margin-bottom: 1px;
    }

    /* Hide Non-Essential Elements */
    .no-print {
        display: none;
    }
        .charges{
         text-align: right;
        }
}

    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header Section -->
        
    <div class="header-section">
           <div class="logo left-logo"><img src="${this.logoUrl}" alt="Invoice Logo"></div>
      <div class="logo"><h3>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h3></div>
            <div class="logo right-logo"><img src="${this.InvoiceLogo}" alt="Company Logo"></div>
    </div>
    <div class="orange-background">${invoiceItem.proformaCardHeaderName}</div>

       <div class="billing-shipping-container">
    <div class="billing-box">
        <div class="billing-header">TO</div>
        <div class="billing-content">
            <p>${invoiceItem.header.ProformaCustomerName}<br>
            ${invoiceItem.header.ProformaAddress}<br>
            ${invoiceItem.header.ProformaCity}<br>
            ${invoiceItem.header.ProformaPincode}<br>
            <strong>GST NO:</strong> ${invoiceItem.header.ProformaGstNo}<br>
            <strong>PAN NO:</strong> ${invoiceItem.header.ProformaPan}</p>
        </div>
    </div>
    <div class="shipping-box">
        <div class="shipping-header">FROM</div>
        <div class="shipping-content">
            <p><strong>INVOICE NO:</strong> ${invoiceItem.invoiceUniqueNumber}<br>
            <strong>DATE:</strong> ${invoiceItem.header.ProformaInvoiceDate}<br>
            <strong>PAN NO:</strong> ${invoiceItem.header.ProformaPanNO}<br>
            <strong>GST NO:</strong> ${invoiceItem.header.ProformaGstNumber}<br>
            <strong>Type of Aircraft</strong>:${invoiceItem.header.ProformaTypeOfAircraft}<br>
            <strong>Seating Capasity</strong>:${invoiceItem.header.ProformaSeatingCapasity}
            </p>
        </div>
    </div>
</div>
    

        <!-- Charges and Taxes Table -->
        <table class="table-bordered">
    <thead>
        <tr>
            <th>S.NO</th>
            <th>DESCRIPTION</th>
            <th>UNITS (Hrs.)</th>
            <th>RATE (INR)</th>
            <th>AMOUNT (INR)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1</td>
            <td colspan="4" class="charges">CHARGES</td>
        </tr>
        ${invoiceItem.chargesList.map(charge => `
        <tr>
            <td></td>
            <td>${charge.description}</td>
            <td>${charge.units || ''}</td>
            <td style="text-align: right"> ${charge.rate}</td>
            <td style="text-align: right">${charge.amount}</td>
        </tr>
        `).join('')}
        <tr class="total-row">
            <td colspan="3"></td>
            <td><strong>TOTAL</strong></td>
            <td style="text-align: right">${invoiceItem.subtotal}</td>
        </tr>
        <tr>
            <td>2</td>
            <td colspan="4" class="charges">TAXES</td>
        </tr>
        ${invoiceItem.taxList.map(tax => `
        <tr>
            <td></td>
            <td>${tax.description}</td>
            <td colspan="2"></td>
            <td style="text-align: right">${tax.amount}</td>
        </tr>
        `).join('')}
        <tr class="grand-total">
            <td colspan="3"></td>
            <td><strong>GRAND TOTAL</strong></td>
            <td style="text-align: right">${invoiceItem.grandTotal}</td>
        </tr>
        <tr>
            <td colspan="5"><strong>${invoiceItem.amountInWords}</strong></td>
        </tr>
    </tbody>
</table>
   <!-- Booking Details -->
   <div class="booking-details">
            <div class="booking-header">BOOKING DETAILS</div>
            <div class="booking-data">
                <div><strong>Date Of Journey:</strong> 03/03/25-04/03/2025</div>
                <div><strong>Sector:</strong> ${invoiceItem.header.BookingSector}</div>
                <div><strong>Billing Flying Time:</strong> ${invoiceItem.header.BookingBillingFlyingTime}</div>
            </div>
        </div>
       
        <!-- Footer Section -->
        <div class="footer">
            <div class="footer-notes"><strong>Note:</strong> <p>${invoiceItem.header.notes}</p></div>
            <div class="footer-signature">
                              <div><h4>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h4></div>
                <img src="${this.signature}" alt="Signature">
                <p>Authorised Signatory</p>
            </div>
        </div>
    </div>
</body>
</html>
 
     `;
 
    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
 
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };
  generateInvoiceHTMLTax2(invoiceItem: InvoiceItem) {
 
    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();
    this.signature = this.imageService.getBase64Signature();
    const invoiceHTML = `

<html>
<head>
   
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .invoice-container1 { width: 80%; margin: auto; background-color: white; padding: 20px; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); box-sizing: border-box; }
        
           .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
      .orange-background {
   
      background-color: rgb(181, 179, 200);
      font-size: 15px;
      color:white;
      padding: 8px;
      text-align: center;
      font-weight: bold;
    }
      /* Booking Details Container */
.billing-shipping-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            gap: 10px;
        }

        .billing-box, .shipping-box {
            width: 48%;
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 6px;
            background-color: #f9f9f9;
        }

        .billing-header, .shipping-header {
           
          
            padding: 10px;
            border-radius: 4px 4px 0 0;
            margin-bottom: 15px;
            font-weight: 600;
            font-size: 1.1em;
        }

        .billing-content p, .shipping-content p {
            margin: 8px 0;
            line-height: 1.6;
        }

        .table-bordered {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .table-bordered th, .table-bordered td {
            border: 1px solid #ddd;
            padding: 12px 15px;
            text-align: left;
        }

        .table-bordered th {
            background-color: #f0f0f0;
            font-weight: 600;
        }

        .table-bordered tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .charges {
            font-weight: 600;
            
        }

        .total-row, .grand-total {
            background-color: #e0e0e0;
            font-weight: 600;
        }

        .booking-details {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 30px;
            background-color: #f9f9f9;
        }

        .booking-header {
           
           
            padding: 10px;
            border-radius: 4px 4px 0 0;
            margin-bottom: 15px;
            font-weight: 600;
            font-size: 1.1em;
        }

        .booking-data div {
            margin: 8px 0;
            line-height: 1.6;
        }
        /* Footer Section */
        .footer { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; }
        .footer-notes { width: 60%; }
        .footer-signature { width: 35%; text-align: center; }
        .footer-signature img { max-width: 150px; height: auto; margin-bottom: 10px; }

        /* Print Media Adjustments */
       @media print {
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .invoice-container1 { width: 80%; margin: auto; background-color: white; padding: 20px; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);  }
        .invoice-container1 { width: 99%; margin: auto; background-color: white; padding: 10px; border: 1px solid #ddd; }
           .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

      .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
 

.header-section .logo {
    display: flex;
    flex-direction: column;
    align-items: center; /* Center content vertically */
}

.header-section .left-logo {
    text-align: left; /* Align text to the left */
}

.header-section .right-logo {
    text-align: right; /* Align text to the right */
}

.header-section .company-name {
    text-align: center; /* Center the company name */
    flex-grow: 1; /* Allow the company name to take up available space */
}

.header-section img {
    max-width: 100px; /* Adjust as needed */
    height: auto;
}
    .header-section, .billing-shipping-container, .booking-details, .table-container, .footer {
        page-break-inside: avoid;
    }

    .table-bordered th, .table-bordered td {
        padding: 8px;
        font-size: 11px;
    }
  .billing-shipping-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            gap: 10px;
        }
    .billing-box, .shipping-box {
        width: 48%;
        padding: 10px;
    }

    .booking-header, .billing-header, .shipping-header {
        padding: 6px;
        font-size: 14px;
    }

    .footer-notes, .footer-signature {
        font-size: 12px;
    }

    .footer-signature img {
        max-width: 100px;
    }

    /* Colors remain the same in print */
    .orange-background {
        background-color: #edab32 !important;
        color: white !important;
    }

    .billing-header, .shipping-header {
         border: 2px solid black;
        color: black !important;
    }

    .booking-header {
     border: 2px solid black;
        color: black !important;
        
    }

    .table-bordered th {
        background-color: #f0f0f0 !important;
    }

    .total-row, .grand-total {
        background-color: #e0e0e0 !important;
    }

    /* Hide unnecessary elements in print */
    .no-print {
        display: none !important;
    }
        body {
        font-size: 11px;
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .invoice-container {
        width: 100%;
        padding: 5px;
        margin: 0;
    }

    .table-bordered th, .table-bordered td {
        padding: 6px;
        font-size: 10px;
    }

    .billing-box, .shipping-box {
        width: 48%;
        padding: 8px;
    }

    .booking-header, .billing-header, .shipping-header {
        padding: 5px;
        font-size: 12px;
    }

    .footer {
        margin-top: 10px;
    }

    .footer-signature img {
        max-width: 80px;
    }
        .booking-details{
            padding: 0px;
        margin: 0px;
        }
        .booking-data{
            padding: 0px;
        margin: 0px;
        }
}

    </style>
</head>
<body>
    <div class="invoice-container1">
        <!-- Header Section -->
        
    <div class="header-section">
           <div class="logo left-logo"><img src="${this.logoUrl}" alt="Invoice Logo"></div>
      <div class="logo"><h3>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h3></div>
            <div class="logo right-logo"><img src="${this.InvoiceLogo}" alt="Company Logo"></div>
    </div>
    <div class="orange-background">${invoiceItem.proformaCardHeaderName}</div>

      <div class="invoice-container">
    <div class="billing-shipping-container">
        <div class="billing-box">
            <div class="billing-header">TO</div>
            <div class="billing-content">
                <p>${invoiceItem.header.ProformaCustomerName}<br>
                ${invoiceItem.header.ProformaAddress}<br>
                ${invoiceItem.header.ProformaCity}<br>
                ${invoiceItem.header.ProformaPincode}<br>
                <strong>GST NO:</strong> ${invoiceItem.header.ProformaGstNo}<br>
                <strong>PAN NO:</strong> ${invoiceItem.header.ProformaPan}</p>
            </div>
        </div>
        <div class="shipping-box">
            <div class="shipping-header">FROM</div>
            <div class="shipping-content">
                <p><strong>INVOICE NO:</strong> ${invoiceItem.invoiceUniqueNumber}<br>
                <strong>DATE:</strong> ${invoiceItem.header.ProformaInvoiceDate}<br>
                <strong>PAN NO:</strong> ${invoiceItem.header.ProformaPanNO}<br>
                <strong>GST NO:</strong> ${invoiceItem.header.ProformaGstNumber}<br>
                <strong>Type of Aircraft</strong>:${invoiceItem.header.ProformaTypeOfAircraft}<br>
                <strong>Seating Capasity</strong>:${invoiceItem.header.ProformaSeatingCapasity}</p>
            </div>
        </div>
    </div>

    <table class="table-bordered">
        <thead>
            <tr>
                <th>S.NO</th>
                <th>DESCRIPTION</th>
                <th>UNITS (Hrs.)</th>
                <th>RATE (INR)</th>
                <th>AMOUNT (INR)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td colspan="4" class="charges">CHARGES</td>
            </tr>
            ${invoiceItem.chargesList.map(charge => `
            <tr>
                <td></td>
                <td>${charge.description}</td>
                <td>${charge.units || ''}</td>
                <td style="text-align: right">${charge.rate}</td>
                <td style="text-align: right">${charge.amount}</td>
            </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="3"></td>
                <td><strong>TOTAL</strong></td>
                <td style="text-align: right">${invoiceItem.subtotal}</td>
            </tr>
            <tr>
                <td>2</td>
                <td colspan="4" class="charges">TAXES</td>
            </tr>
            ${invoiceItem.taxList.map(tax => `
            <tr>
                <td></td>
                <td style="text-align: right">${tax.description}</td>
                <td colspan="2"></td>
                <td style="text-align: right">${tax.amount}</td>
            </tr>
            `).join('')}
            <tr class="grand-total">
                <td colspan="3"></td>
                <td><strong>GRAND TOTAL</strong></td>
                <td style="text-align: right">${invoiceItem.grandTotal}</td>
            </tr>
            <tr>
                <td colspan="5"><strong>${invoiceItem.amountInWords}</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="booking-details">
        <div class="booking-header">BOOKING DETAILS</div>
        <div class="booking-data">
            <div><strong>Date Of Journey:</strong> 03/03/25-04/03/2025</div>
            <div><strong>Sector:</strong> ${invoiceItem.header.BookingSector}</div>
            <div><strong>Billing Flying Time:</strong> ${invoiceItem.header.BookingBillingFlyingTime}</div>
        </div>
    </div>

 
        <!-- Footer Section -->
        <div class="footer">
            <div class="footer-notes"><strong>Note:</strong> <p>${invoiceItem.header.notes}</p></div>
            <div class="footer-signature">
                  <div><h4>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h4></div>
                <img src="${this.signature}" alt="Signature">
                <p>Authorised Signatory</p>
            </div>
        </div>
    </div>
</body>
</html>
 
     `;
 
    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
 
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };
 generateInvoiceHTMLTax3 (invoiceItem: InvoiceItem) {
 
    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();
    this.signature = this.imageService.getBase64Signature();
    const invoiceHTML = `
  

<html>
<head>
   
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .invoice-container1 { width: 80%; margin: auto; background-color: white; padding: 20px; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); box-sizing: border-box;  }
        
           .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
      .orange-background {
      background-color: rgb(93, 92, 98);
      font-size: 14px;
      color:white;
      padding: 8px;
      text-align: center;
      font-weight: bold;
      margin-bottom:10px;
    }
      
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
          

.header-section .logo {
    display: flex;
    flex-direction: column;
    align-items: center; /* Center content vertically */
}

.header-section .left-logo {
    text-align: left; /* Align text to the left */
}

.header-section .right-logo {
    text-align: right; /* Align text to the right */
}

.header-section .company-name {
    text-align: center; /* Center the company name */
    flex-grow: 1; /* Allow the company name to take up available space */
}

.header-section img {
    max-width: 100px; /* Adjust as needed */
    height: auto;
}

      /* Booking Details Container */
.billing-shipping-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
        }
      
        .billing-box, .shipping-box {
            width: 48%;
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 6px;
            background-color: #f9f9f9;
        }
    .invoice-container .billing-header {
        background-color: #7e22ce;
        color: white !important;
        text-align: center;
        padding: 6px;
        font-size: 12px;
    }

       
        .billing-content p, .shipping-content p {
            margin: 8px 0;
            line-height: 1.6;
        }

        .table-bordered {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .table-bordered th, .table-bordered td {
            border: 1px solid #ddd;
            padding: 12px 15px;
            text-align: left;
        }

        .table-bordered th {
            
            font-weight: 600;
        }

        

        .charges {
            font-weight: 600;
            
        }

        .total-row, .grand-total {
            background-color: #e0e0e0;
            font-weight: 600;
        }

    

        .booking-header {
   background-color: #7e22ce;
         color: white !important;
         text-align:center;
        
    }

        .booking-data div {
            margin: 8px 0;
            line-height: 1.6;
        }
        /* Footer Section */
        .footer { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; }
        .footer-notes { width: 60%; }
        .footer-signature { width: 35%; text-align: center; }
        .footer-signature img { max-width: 150px; height: auto; margin-bottom: 10px; }

        /* Print Media Adjustments */
  
    @media print {
   

    body { 
        font-family: Arial, sans-serif; 
        margin: 0; 
        padding: 0; 
        font-size: 12px; /* Reduce font size */
    }

    .invoice-container1 { 
        width: 100%; 
        background-color: white; 
        padding: 10px; 
        border: 1px solid #ddd; 
        box-shadow: none; 
        box-sizing: border-box;
    
    }
            .orange-background {
background-color: rgb(93, 92, 98);
        color: white !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
         margin-bottom:10px;
    }


    .header-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header-section img {
        max-width: 80px; /* Reduce logo size */
    }

   
    .billing-header, .booking-header {
        background-color: #7e22ce !important;
        color: white !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        padding: 5px;
        font-size: 12px;
    }     .billing-shipping-container {
        margin-bottom: 0 !important; /* Remove space below */
        padding-bottom: 0 !important;
    }
    
    .table-bordered {
        margin-top: 0 !important; /* Remove space above */
        padding-top: 0 !important;
    }


    .table-bordered {
        width: 100%;
        border-collapse: collapse;
    }
  
    .table-bordered th,
    .table-bordered td {
        border: 1px solid black !important;
        padding: 5px; /* Reduce padding */
        font-size: 14px; /* Reduce font size */
    }

    .total-row, .grand-total {
        background-color: #e0e0e0 !important;
        -webkit-print-color-adjust: exact;
    }

    /* Footer Section */
    .footer { 
        display: flex; 
        justify-content: space-between; 
        align-items: flex-start; 
        margin-top: 5px; 
    }
    
    .footer-notes { 
        width: 55%; 
        font-size: 13px; 
    }
        .back{
       
        -webkit-print-color-adjust: exact;
        }
    
    .footer-signature { 
        width: 40%; 
        text-align: center; 
    }
    
    .footer-signature img { 
        max-width: 120px; /* Reduce signature image size */
        height: auto; 
        margin-bottom: 5px; 
    }

    /* Prevent page breaks */
    .table-bordered tr,
    .billing-shipping-container {
        page-break-inside: avoid;
    }

    /* Hide unnecessary UI elements */
    .no-print {
        display: none !important;
    }
}


    </style>
</head>
<body>
    <div class="invoice-container1">
        <!-- Header Section -->
        
    <div class="header-section">
           <div class="logo left-logo"><img src="${this.logoUrl}" alt="Invoice Logo"></div>
      <div class="logo"><h3>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h3></div>
            <div class="logo right-logo"><img src="${this.InvoiceLogo}" alt="Company Logo"></div>
    </div>
    
    <div class="orange-background">${invoiceItem.proformaCardHeaderName}</div>

      <div class="invoice-container">
    <div class="billing-shipping-container">
    <table class="table-bordered">
        <thead>
            <tr>
                <th colspan="2" class="billing-header">TO</th>
                <th colspan="2" class="billing-header">FROM</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Name</strong></td>
                <td>${invoiceItem.header.ProformaCustomerName}</td>
                <td><strong>INVOICE NO:</strong></td>
                <td>${invoiceItem.invoiceUniqueNumber}</td>
            </tr>
            <tr>
                <td><strong>Address</strong></td>
                <td>${invoiceItem.header.ProformaAddress}</td>
                <td><strong>DATE:</strong></td>
                <td>${invoiceItem.header.ProformaInvoiceDate}</td>
            </tr>
            <tr>
                <td><strong>City</strong></td>
                <td>${invoiceItem.header.ProformaCity}</td>
                <td><strong>PAN NO:</strong></td>
                <td>${invoiceItem.header.ProformaPanNO}</td>
            </tr>
            <tr>
                <td><strong>Pincode</strong></td>
                <td>${invoiceItem.header.ProformaPincode}</td>
                <td><strong>GST NO:</strong></td>
                <td>${invoiceItem.header.ProformaGstNumber}</td>
            </tr>
            <tr>
                <td><strong>GST NO:</strong></td>
                <td>${invoiceItem.header.ProformaGstNo}</td>
                <td><strong>Type of Aircraft</strong></td>
                <td>${invoiceItem.header.ProformaTypeOfAircraft}</td>
            </tr>
            <tr>
                <td><strong>PAN NO:</strong></td>
                <td>${invoiceItem.header.ProformaPan}</td>
                <td><strong>Seating Capacity</strong></td>
                <td>${invoiceItem.header.ProformaSeatingCapasity}</td>
            </tr>
        </tbody>
    </table>
</div>
    <table class="table-bordered">
        <thead>
            <tr>
                <th class ="back">S.NO</th>
                <th class ="back">DESCRIPTION</th>
                <th class ="back">UNITS(Hrs.)</th>
                <th class ="back">RATE (INR)</th>
                <th class ="back">AMOUNT (INR)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td colspan="4" class="charges">CHARGES</td>
            </tr>
            ${invoiceItem.chargesList.map(charge => `
            <tr>
                <td></td>
                <td>${charge.description}</td>
                <td>${charge.units || ''}</td>
                <td style="text-align: right">${charge.rate}</td>
                <td style="text-align: right">${charge.amount}</td>
            </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="3"></td>
                <td><strong>TOTAL</strong></td>
                <td style="text-align: right">${invoiceItem.subtotal}</td>
            </tr>
            <tr>
                <td>2</td>
                <td colspan="4" class="charges">TAXES</td>
            </tr>
            ${invoiceItem.taxList.map(tax => `
            <tr>
                <td></td>
                <td style="text-align: right">${tax.description}</td>
                <td colspan="2"></td>
                <td style="text-align: right">${tax.amount}</td>
            </tr>
            `).join('')}
            <tr class="grand-total">
                <td colspan="3"></td>
                <td><strong>GRAND TOTAL</strong></td>
                <td style="text-align: right">${invoiceItem.grandTotal}</td>
            </tr>
            <tr>
                <td colspan="5"><strong>${invoiceItem.amountInWords}</strong></td>
            </tr>
        </tbody>
    </table>

    <table class="table-bordered">
            <thead>
<div class="booking-header"><strong> BOOKING DETAILS </strong></div>
                <tr>
                    <th>Date Of Journey</th>
                    <th>Sector</th>
                    <th>Billing Flying Time</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>03/03/25 - 04/03/2025</td>
                    <td>${invoiceItem.header.BookingSector}</td>
                    <td>${invoiceItem.header.BookingBillingFlyingTime}</td>
                </tr>
            </tbody>
        </table>

 
        <!-- Footer Section -->
        <div class="footer">
            <div class="footer-notes"><strong>Note:</strong> <p>${invoiceItem.header.notes}</p></div>
            <div class="footer-signature">
                  <div><h4>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h4></div>
                <img src="${this.signature}" alt="Signature">
                <p>Authorised Signatory</p>
            </div>
        </div>
    </div>
</body>
</html>
 
     `;
 
    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
 
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  }
  generateInvoiceHTMLTax4(invoiceItem: InvoiceItem) {
    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();
    this.signature = this.imageService.getBase64Signature();
 
    const invoiceHTML = `
     
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>GST Invoice</title>
      <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .invoice-container1 { width: 80%; margin: auto; background-color: white; padding: 5px; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); box-sizing: border-box;  }
               .orange-background {
          background-color:  teal !important;
          color: black !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
           text-align:center;
           padding: 8px;
      }
   
   
       .header-section {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 10px;
      border: 1px solid #ddd;
   }
       .booking-details {
    border: 1px solid #ccc;
    width: 100%;
  }
 
  .booking-header {
    background-color: rgb(88, 98, 145);
    padding: 5px;
    color:white;
      text-align: center;
    border-bottom: 1px solid #ccc;
  }
 
  .booking-data {
        padding: 5px;
  width: 100%;
  display: flex;
  font-size: 14px;
  }
 
   .header-section .logo {
     display: flex;
     flex-direction: column;
     align-items: center;
     width:558px;
   }
 
   .header-section .left-logo,
   .header-section .right-logo {
     width: 112px;* Adjust as needed */
   }
     
  .details-container {
      display: flex;
      gap: 10px;
  }
 
  .company-details, .invoice-info {
      width: 50%;
      background: #f8f9fa;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
       border-bottom: 14px solid black;
  }
 
   .header-section img {
     max-width: 100%;
     height: auto;
   }
          .company-details, .bill-to, .invoice-info {
              margin-bottom: 12px;
              border: 1px solid #ddd;
               background: #f8f9fa;
                border-bottom: 14px solid black;
          }
          .company-details p, .bill-to p, .invoice-info p {
              margin: 5px 0;
          }
          table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 9px;
          }
          table, th, td {
              border: 1px solid #ddd;
          }
          th, td {
              padding: 5px;
              text-align: end;
          }
          th {
              background-color: #f9f9f9;
          }
          .totals {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0px;
          }
          .amount-words, .summary {
              width: 48%;
          }
          .footer {
              text-align: end;
              margin-top: 10px;
          }
              .tax-list {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    padding: 10px;
  }  .billing-shipping-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            gap: 10px;
        }
    .billing-box{
        width: 48%;
        padding: 10px;
       
    }
        .shipping-box {
        width: 48%;
        border-left: 14px solid black;
    }
 
    .booking-header, .billing-header, .shipping-header {
        padding: 3px;
        font-size: 12px;
    }
        .invoice-booking-details {
    display: flex;
    justify-content: space-between;
    border:none;
}
 
.invoice-details, .booking-details {
    width: 50%;
    padding: 5px;
}
 
.booking-data {
    display: flex;
    justify-content: space-between;
}
 
.booking-data > div {
    padding: 5px;
}
 
.bold {
    font-weight: bold;
    margin-bottom: 5px;
}
 
  .tax-item {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px solid #eee;
    font-weight: bold;
  }
 
  .tax-description {
    flex: 1;
  }
    .amount-container {
    display: flex;
    flex-direction: column;
  }
 
  .amount-words, .terms-conditions {
    width: 100%; /* Ensure full width */
    margin-bottom: 10px; /* Add spacing between them */
  }
 
 
  .tax-amount {
    flex: 0.3;
    text-align: right;
  }
    @media print {
 body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        transform: scale(0.9); /* Shrinks the content to fit */
        transform-origin: top center;
    }
     .invoice-container { width: 100%; background-color: white; padding: 10px; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); box-sizing: border-box;  }
               .orange-background {
          background-color:  teal  !important;
          color: white !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
           text-align:center;
           padding: 5px;
      }
            .booking-details {
    border: 1px solid #ccc;
    width: 100%;
  }
 
  .booking-header {
    background-color: rgb(88, 98, 145);
    padding: 5px;
    color:white;
      text-align: center;
    border-bottom: 1px solid #ccc;
  }
 
 
    .booking-header, .billing-header, .shipping-header {
        padding: 5px;
        font-size: 12px;
    }
 
     .billing-shipping-container {
            display: flex;
            justify-content: space-between;
            margin: 0px;
            padding:0px;
            gap: 10px;
        }
   .billing-box{
        width: 48%;
 
       
       
    }
        .shipping-box {
        width: 48%;
        border-left: 1px solid black;
        padding-left:5px;
    }
 
    .booking-header, .billing-header, .shipping-header {
     
        font-size: 12px;
         margin: 0px;
            padding:0px;
    }
        .invoice-booking-details {
    display: flex;
    justify-content: space-between;
    border:none;
}
 
.invoice-details, .booking-details {
    width: 50%;
   margin: 0px;
    padding:0px;
 
}
 
.booking-data {
    display: flex;
    justify-content: space-between;
}
 
.booking-data > div {
    padding: 1px;
}
 
.bold {
    font-weight: bold;
    margin-bottom: 0px;
    text-align:left;
}
 
 
   
     .header-section {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 1px;
      border: 1px solid #ddd;
   }
   .header-section img {
     max-width: 100%;
     height: auto;
   }
   .header-section .logo {
     display: flex;
     flex-direction: column;
     align-items: center;
     width:558px;
   }
 
   .header-section .left-logo,
   .header-section .right-logo {
     width: 112px;* Adjust as needed */
   }
      .amount-container {
    display: flex;
    flex-direction: column;
  }
 
 
 .details-container {
      display: flex;
      gap: 0px;
  }
          table { width: 100%; border-collapse: collapse; margin-bottom: 0px; }
            table, th, td { border: 1px solid #ddd; }
            th, td { padding: 5px; text-align: end; }
            th { background-color: #f9f9f9; }
            .totals { display: flex; justify-content: space-between; margin-bottom: 0px; }
            .amount-words, .summary {
            width: 100%;
            padding:0px;
            margin:0px;
             }
        .footer {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-top: 0px;
    }
   
    .footer-notes {
        width: 55%;
        font-size: 14px;
         text-align: left;
       
    }
        .back{
       
        -webkit-print-color-adjust: exact;
        }
   
    .footer-signature {
        width: 40%;
        text-align: center;
    }
   
    .footer-signature img {
        max-width: 120px; /* Reduce signature image size */
        height: auto;
        margin-bottom: 0px;
    }
              .tax-list {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    padding: 0px;
  }
   
 
  .tax-item {
    display: flex;
    justify-content: space-between;
    padding: 0px;
    margin:0px;
    border-bottom: 1px solid #eee;
  }
 
  .tax-description {
    flex: 1;
  }
 
  .tax-amount {
    flex: 0.3;
    text-align: right;
  }
    .billing-header{
            border-bottom: 1px solid black;
         
 
    }
 
    @page {
        size: A4;
        margin: 5mm; /* Reduce margins */
    }
 
    body {
        font-size: 12px; /* Reduce font size */
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
 
    }
 
    .invoice-container {
        width: 100%;
        border:1px solid black;
        padding: 5px;
    }
 
    .header-section img {
        max-width: 90px; /* Reduce logo size */
    }
 
    .footer-signature img {
        max-width: 100px; /* Reduce signature size */
    }
 
    .billing-shipping-container {
        display: flex;
        gap: 5px;
        padding: 5px;
    }
 
    .billing-box, .shipping-box {
        width: 48%;
        padding: 5px;
    }
 
    .booking-header, .billing-header, .shipping-header {
        font-size: 10px;
        padding: 3px;
    }
 
    table, th, td {
        border: 1px solid #ddd;
        font-size:16px;
        padding: 10px; /* Reduce table cell padding */
    }
 
    th,  {
    text-align:left;
        font-size: 10px; /* Reduce text size in table */
    }
    td {
    text-align:center
        font-size: 10px; /* Reduce text size in table */
    }
 
    .tax-list {
    font-size:14px;
        padding: 10px;
        font-weight: bold;
    }
.amount-words, .terms-conditions {
font-size:14px;
    width: 100%; /* Ensure full width */
    margin-bottom: 10px; /* Add spacing between them */
    padding:10px;
  }
    .footer {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-top: 0;
    }
 
    .footer-notes {
        width: 50%;
        font-size: 12px;
        text-align: left;
    }
 
    .footer-signature {
        width: 40%;
        text-align: center;
    }
 
 
  }
 
      </style>
  </head>
  <body>
     
     <div class="header-section">
             <div class="logo left-logo"><img src="${this.logoUrl}" alt="Invoice Logo"></div>
        <div class="logo"><h3>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h3></div>
              <div class="logo right-logo"><img src="${this.InvoiceLogo}" alt="Company Logo"></div>
      </div>
 
     
      <div class="orange-background">${invoiceItem.proformaCardHeaderName}</div>
   
     <div class="invoice-container">
    <div class="billing-shipping-container">
        <div class="billing-box">
            <div class="billing-header"><strong>FROM</strong></div>
            <div class="billing-content">
            <p><b>PAN NO:</b> ${invoiceItem.header.ProformaPanNO}</p>
            <p><b>GST NO:</b> ${invoiceItem.header.ProformaGstNumber}</p>
            <p><b>Type Of Aircraft:</b> ${invoiceItem.header.ProformaTypeOfAircraft}</p>
            <p><b>Seating Capacity:</b> ${invoiceItem.header.ProformaSeatingCapasity}</p>
            </div>
        </div>
        <div class="shipping-box">
            <div class="shipping-header billing-header"><strong>INVOICE DETAILS</strong></div>
            <div class="shipping-content ">
                <p><b>Invoice No.:</b> ${invoiceItem.invoiceUniqueNumber}</p>
            <p><b>Date:</b> ${invoiceItem.header.ProformaInvoiceDate}</p>
              </div>
        </div>
    </div>
    <br>
 
      <div class="billing-shipping-container">
        <div class="billing-box">
            <div class="billing-header"><strong>TO</strong></div>
            <div class="billing-content">
                <p>${invoiceItem.header.ProformaCustomerName}<br>
                ${invoiceItem.header.ProformaAddress}<br>
                ${invoiceItem.header.ProformaCity}<br>
                ${invoiceItem.header.ProformaPincode}<br>
                <strong>GST NO:</strong> ${invoiceItem.header.ProformaGstNo}<br>
                <strong>PAN NO:</strong> ${invoiceItem.header.ProformaPan}</p>
            </div>
        </div>
        <div class="shipping-box">
            <div class="shipping-header billing-header"><strong>BOOKING DETAILS</strong></div>
            <div class="shipping-content">
             <p><b>Date Of Journey:</b> 03/03/25-04/03/2025</p>
            <p><b>Sector:</b> ${invoiceItem.header.BookingSector}</p>
                <p><b>Billing Flying Time:</b> ${invoiceItem.header.BookingBillingFlyingTime}</p>
        </div>
    </div>
    </div>
 
 
      <table>
          <thead>
              <tr>
                  <th style="text-align:left;">S.NO</th>
                  <th style="text-align:left;">DESCRIPTION</th>
                  <th style="text-align:left;">UNITS</th>
                  <th style="text-align:left;">RATE</th>
                  <th style="text-align:left;">AMOUNT</th>
              </tr>
          </thead>
         <tbody>
               <tr>
                <td>1</td>
                <td class="bold" >CHARGES</td>
                <td class="text-right" style="text-align:center;"></td>
                <td class="text-right" style="text-align:center;"></td>
                <td style="text-align:center;"></td>
              </tr>
                  ${invoiceItem.chargesList.map((charge, index) => `
                    <tr>
                     
                       <td class="text-center" style="text-align:center;"></td>
                      <td style="text-align:center;">${charge.description}</td>
                      <td style="text-align:center;">${charge.units ? charge.units : ''}</td>
                      <td ">${charge.rate}</td>
                      <td class="text-right" style="text-align:center;">${charge.amount}</td>
                    </tr>
                  `).join('')}
                 
                  <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                    <td  class="text-right bold" style="background-color: rgb(181, 179, 200);" style="text-align:center;">TOTAL</td>
                    <td class="text-right bold"  style="background-color: rgb(181, 179, 200);" style="text-align:center;">${invoiceItem.subtotal}</td>
                  </tr>
                  <tr>
                </tbody>
              </table>
 
     
         
          <div class="summary" style="display:flex">
             
 
            <div style="width:70%">
            </div>
              <div class="tax-list" style="width:30%">
                       ${invoiceItem.taxList.map(tax => `
                      <div class="tax-item" >
                      <div class="tax-description">${tax.description}</div>
                      <div class="tax-amount text-right">${tax.amount}</div>
                    </div>
                  `).join('')}
               </div>
 
             </div>
             
               <div class="totals">
          <div class="amount-words" style="display:flex;width:100%">
          <div style="width:70%">
             <p><strong>AMOUNT IN WORDS:</strong><br>${invoiceItem.amountInWords}</br></p>
          </div>
          <div style="width:30%;text-align:end">
           <p style="font-size:16px" padding:10px;><b>TOTAL AMOUNT</b> ₹ ${invoiceItem.grandTotal}</p>
          </div>
         
          </div>
             
          </div>
      
 
      <div class="footer">
            <div class="footer-notes" style="font-size:16px" ><strong>Note:</strong> <p>${invoiceItem.header.notes}</p></div>
            <div class="footer-signature">
                  <div><h4>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h4></div>
                <img src="${this.signature}" alt="Signature">
                <p>Authorised Signatory</p>
            </div>
        </div>
        </div>
      </div>
  </body>
  </html>
    `;
 
    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
        newWindow.document.write(invoiceHTML);
        newWindow.document.close();
 
        setTimeout(() => {
            newWindow.print();
        }, 500);
    }
  }
  generateInvoiceHTMLTax5 (invoiceItem: InvoiceItem) {
 
    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();
    this.signature = this.imageService.getBase64Signature();
    const invoiceHTML = `
 
 
<html>
<head>
    <style>
       body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 5px;
    background-color: #f4f4f4;
        border: 1px solid black;
}
       
 
 .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
        }
      .orange-background {
      background-color: rgb(93, 92, 98);
      font-size: 12px;
      color:white;
      padding: 5px;
      text-align: center;
      font-weight: bold;
    }
     
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
            .tax-item {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    font-weight: bold;
  }
 
  .tax-description {
    flex: 1;
  }
  .tax-amount {
    flex: 0.3;
    text-align: right;
  }
 
         
 
.header-section .logo {
    display: flex;
    flex-direction: column;
    align-items: center; /* Center content vertically */
}
 
.header-section .left-logo {
    text-align: left; /* Align text to the left */
}
 
.header-section .right-logo {
    text-align: right; /* Align text to the right */
}
 
.header-section .company-name {
    text-align: center; /* Center the company name */
    flex-grow: 1; /* Allow the company name to take up available space */
}
 
.header-section img {
    max-width: 80px; /* Adjust as needed */
    height: auto;
}
 
 
.from-to-ship {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}
 
.from, .to, .ship {
    width: 32%;
    border: 1px solid #ddd;
    padding: 8px;
    font-size: 14px;
}
 
.items {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    margin-bottom: 5px;
    height: 205px;
}
 
.items th, .items td {
    border: 1px solid #ddd;
    padding: 6px;
    text-align: left;
    font-weight: bold;
}
 
.items th {
    background-color: #f0f0f0;
}
 
.items tbody tr:nth-child(even) {
    background-color: #f9f9f9;
}
 
.payment {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}
 
.payment-instruction {
    width: 45%;
    border: 1px solid #ddd;
    padding: 15px;
}
 
.totals {
     width: 99%;
   
    padding: 3px;
    font-size: 14px;
}
 
.totals p {
    margin: 5px 0;
}
 
.notes {
  padding: 8px;
  font-size: 15px;
  margin-bottom: 5px;
  width: 433px;
}
 
.signatures {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}
 
.client-signature, .business-signature {
  width: 45%;
  text-align: center;
}
 
        /* Print Media Adjustments */
 
    @media print {
     @page {
      size: A4;
      margin: 5mm;
  }
 body {
    font-family: Arial, sans-serif;
    margin: 0;
    -webkit-print-color-adjust: exact; /* Chrome, Safari */
        print-color-adjust: exact; /* Firefox */
    padding: 5px;
    background-color: #f4f4f4;
        border: 1px solid black;
}
 
    .orange-background {
        background-color: brown;
        font-size: 12px;
        color: white;
        padding: 5px;
        text-align: center;
        font-weight: bold;
    }
   
 
 .header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
    margin-bottom: 5px;
}
     
     
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
             page-break-inside: avoid;
        }
         
 
.header-section .logo {
    display: flex;
    flex-direction: column;
    align-items: center; /* Center content vertically */
}
 
.header-section .left-logo {
    text-align: left; /* Align text to the left */
}
 
.header-section .right-logo {
    text-align: right; /* Align text to the right */
}
 
.header-section .company-name {
    text-align: center; /* Center the company name */
    flex-grow: 1; /* Allow the company name to take up available space */
}
 
.header-section img {
    max-width: 80px; /* Adjust as needed */
    height: auto;
}
 
 
.from-to-ship {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
     font-weight: bold;
}
 
.from, .to, .ship {
    width: 32%;
    border: 1px solid #ddd;
    padding: 8px;
   font-size: 14px;
     page-break-inside: avoid;
      font-weight: bold;
}
      .tax-item {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    font-weight: bold;
  }
 
  .tax-description {
    flex: 1;
  }
  .tax-amount {
    flex: 0.3;
    text-align: right;
  }
 
 
.items {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
    margin-bottom: 5px;
     page-break-inside: avoid;
     height: 205px;
     font-size: 14px;
}
 
.items th, .items td {
    border: 1px solid #ddd;
    padding: 6px;
    text-align: end;
        font-weight: bold;
}
 
.items th {
    background-color: #f0f0f0;
          padding: 4px;
           font-weight: bold;
}
 
.items tbody tr:nth-child(even) {
    background-color: #f9f9f9;
}
 
.payment {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}
 
.payment-instruction {
    width: 45%;
    border: 1px solid #ddd;
    padding: 15px;
}
 
.totals {
   
    width: 99%;
   
    padding: 3px;
    font-size: 14px;
     page-break-inside: avoid;
      font-weight: bold;
}
 
.totals p {
    margin: 3px 0;
}
 
.notes {
     padding: 8px;
           font-size: 15px;
            margin-bottom: 5px;
            width: 433px;  
             font-weight: bold;
}
           
 
.signatures {
    display: flex;
    justify-content: space-between;
     page-break-inside: avoid;
      font-size: 12px;
       font-weight: bold;
}
  .signatures img {
                max-width: 100px;
            }
.client-signature, .business-signature {
    width: 45%;
    text-align: center;
}
 
 
    </style>
</head>
<body>
    <div class="invoice-container1">
        <!-- Header Section -->
       
    <div class="header-section">
           <div class="logo left-logo"><img src="${this.logoUrl}" alt="Invoice Logo"></div>
      <div class="logo"><h3>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h3></div>
            <div class="logo right-logo"><img src="${this.InvoiceLogo}" alt="Company Logo"></div>
    </div>
   
    <div class="orange-background">${invoiceItem.proformaCardHeaderName}</div>
 
        <div class="from-to-ship">
            <div class="from">
              <p><b>From:</b></p>
              <p><b>Invoice No.:</b> ${invoiceItem.invoiceUniqueNumber}</p>
              <p><b>PAN NO:</b> ${invoiceItem.header.ProformaPanNO}</p>
              <p><b>GST NO:</b> ${invoiceItem.header.ProformaGstNumber}</p>
              <p><b>Type Of Aircraft:</b> ${invoiceItem.header.ProformaTypeOfAircraft}</p>
              <p><b>Seating Capacity:</b> ${invoiceItem.header.ProformaSeatingCapasity}</p>
              <p><b>Date:</b> ${invoiceItem.header.ProformaInvoiceDate}</p>
            </div>
            <div class="to">
                <p><b>To:</b></p>
                <p><b>Customer Name:</b> ${invoiceItem.header.ProformaCustomerName}</p>
                <p><b>Address:</b> ${invoiceItem.header.ProformaAddress}</p>
                <p><b>City - State - Pincode:</b> ${invoiceItem.header.ProformaCity} - ${invoiceItem.header.ProformaState} - ${invoiceItem.header.ProformaPincode}</p>
                <p><b>PAN No.:</b> ${invoiceItem.header.ProformaPan}</p>
                <p><b>GST NO:</b> ${invoiceItem.header.ProformaGstNo}</p>
            </div>
            <div class="ship">
              <p><b>Booking Details:</b></p>
              <p><b>Date Of Journey:</b>  ${invoiceItem.header.BookingDateOfJourny}</p>
              <p><b>Sector:</b> ${invoiceItem.header.BookingSector}</p>
              <p><b>Sector:</b>  ${invoiceItem.header.BookingSector}</p>
              <p><b>Billing Flying Time:</b> ${invoiceItem.header.BookingBillingFlyingTime}</p>
            </div>
          </div>
        </div>
 
        <table class="items">
            <thead>
                <tr>
                   <th>S.NO</th>
                  <th>Description</th>
                  <th>Units</th>
                  <th>Rate</th>
                  <th>Amount</th>              
                </tr>
            </thead>
            <tbody>
               <tr>
                <td>1</td>
                <td class="bold">Charges</td>
                <td class="text-right"></td>
                <td class="text-right"></td>
                <td></td>
              </tr>
                  ${invoiceItem.chargesList.map((charge, index) => `
                    <tr>
                     
                       <td class="text-center"></td>
                      <td>${charge.description}</td>
                      <td class="text-center">${charge.units ? charge.units : ''}</td>
                      <td class="text-right">${charge.rate}</td>
                      <td class="text-right">${charge.amount}</td>
                    </tr>
                  `).join('')}
                 
                  <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                    <td  class="text-right bold" style="background-color: rgb(181, 179, 200); text-align: end;">Total</td>
                    <td class="text-right bold"  style="background-color: rgb(181, 179, 200); text-align: end;">${invoiceItem.subtotal}</td>
                  </tr>
                  <tr>
            </tbody>
        </table>
   
         
         <div class="summary" style="
    text-align: end;>
              <div class="tax-list">
                       ${invoiceItem.taxList.map(tax => `
                      <div class="tax-item">
                      <div class="tax-description">${tax.description}</div>
                      <div class="tax-amount">${tax.amount}</div>
                    </div>
                  `).join('')}
                  <p><b>Total Invoice Amount:</b> ₹ ${invoiceItem.grandTotal}</p>
               </div>
      </div>
      <div class="totals">
          <div class="amount-words">
             <div><strong>Amount in words:</strong> <p>${invoiceItem.amountInWords}</p></div>
          </div>
        </div>
        <div class="notes">
            <div><strong>Notes:</strong> <p>${invoiceItem.header.notes}</p></div>
           
        </div>
 
        <div class="signatures">
            <div class="client-signature">
               
            </div>
            <div class="business-signature">
              <div>
              <div><h4>RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED</h4></div>
                <img src="${this.signature}" alt="Company Logo" class="logo"></div>
                Authorised Signatory        
              </div>
            </div>
        </div>
    </div>
</body>
</html>
 
     `;
 
    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
 
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  }
 
 
 
}