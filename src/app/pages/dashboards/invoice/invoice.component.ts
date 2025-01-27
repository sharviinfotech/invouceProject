import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NumberToWordsService } from 'src/app/number-to-words.service';

interface TaxItem {
  description: string;
  percentage: number;
  amount: number;
}
interface ChargeItem {
  description: string;
  units?: string | null;  // Adding 'units' property
  rate: number;
  amount: number;
}

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  standalone: true
})
export class InvoiceComponent {
  
  newInvoiceCreation!: FormGroup;
  showNewInvoice = false;
  panForm: FormGroup;

  activeTab: string = 'AllInvoice'; // Change this based on tab logic
  logoUrl: string | null = null;
  isHoveringLogo: boolean = false;
  isHoveringRemove: boolean = false;
  

  chargeItems: ChargeItem[] = [
    {
      description: 'HYDERABAD-CHENNAI-HYDERABAD',
      units: '03.30 Hrs.',  // Only for the first item
      rate: 150000,
      amount: 525000
    },
    {
      description: 'GROUND HANDLING CHARGES',
      units: null,  // No units for this item
      rate: 120000,
      amount: 120000
    },
    {
      description: 'B.L.T CHARGES',
      units: null,  // No units
      rate: 0,
      amount: 0
    },
    {
      description: 'A.M.E CHARGES',
      units: null,  // No units
      rate: 0,
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
      percentage: 0,
      amount: 0
    }
  ];
  show:boolean=true
  subtotal: number = 576250;
  grandTotal: number = 679975;
  amountInWords: string = 'Six Lakhs Seventy Nine Thousand Nine Hundred Seventy Five Only.';

  @ViewChild('logoInput') logoInput!: ElementRef;
 

  constructor(private fb: FormBuilder, private numberToWordsService:NumberToWordsService) {
    this.newInvoiceCreation = this.fb.group({
      invoiceHeader: ['', Validators.required],
      ProformaCompanyName: ['', Validators.required],
      ProformaAddress: ['', [Validators.required, Validators.email]],
      ProformaCity: [''],
      ProformaSate: [''],
      ProformaPincode: ['', Validators.required],
      ProformaGstNo: ['', [Validators.required, Validators.email]],
      ProformaPanNO: [''],
      ProformaInvoiceNumber: [''],
      ProformaInvoiceDate: [''],
      proformaPanNumber:[''],
      proformaGstNo: [''],
      proformatypeOfAircraft: [''],
      proformaseatingcapasity: [''],
      bookingdetailsdateofjourney: [''],
      bookingdetailssector: [''],
      bookingdetailsbillingflyingtime: [''],
      notes: [''],
      bookingdateOfjourny: [''],
      bookingsector: [''],
      bookingbillingflyingtime: [''],
      accountName: [''],
      bankname: [''],
      accountNumber: [''],
      branch:[''],
      ifsccode: ['']
    });
  }
//  invoices: [
//         {
//             header: {
//                 "invoiceHeader": "RITHWIK GREEN POWER & AVIATION PRIVATE LIMITED ",
//                 "ProformaCompanyName": "MYTHRI MOVIE MAKERS",
//                 "ProformaAddress": "PLOT NO. 330, JUBLI HILLS PAN ROAD NO. 25, ",
//                 "ProformaCity": "HYDERABAD",
//                 "ProformaSate": "TELANGANA",
//                 "ProformaPincode": "500033",
//                 "ProformaGstNo": "36AAWFM8714H1ZO",
//                 "ProformaPanNO": "AAWFM8714H",
//                 "ProformaInvoiceNumber": "RGPAPL/PI-803/12-2024",
//                 "ProformaInvoiceDate": "29-12-2024",
//                 "ProformaPan": "AAICS9057Q",
//                 "ProformaGstNumber": "36AAICS9057Q1ZD",
//                 "ProformaTypeOfAircraft": "B-250 GT (VT-VIN)",
//                 "ProformaSeatingCapasity": 7,
//                 "notes": "In case of any discrepancy contact accounts within 5 days of receiving the bill",
//                 "BookingDateOfJourny": " 29-12-2024",
//                 "BookingSector": "HYDERABAD-CHENNAI-HYDERABAD",
//                 "BookingBillingFlyingTime": " 03.30 Hrs"
//             },
//             "bankDetails": {
//                 "accountName": "sunil",
//                 "bank": " KOTAK MAHINDRA BANK",
//                 "accountNumber": "07452 11990",
//                 "branch": "BANJARA HILLS",
//                 "ifscCode": "KKBK0007461  (NEFT/ RTGS)"
//             },
//             "_id": "6797561d11208e0faaac4725",
//             "invoiceReferenceNo": 20,
//             "chargesList": [
//                 {
//                     "description": "HYDERABAD-CHENNAI-HYDERABAD",
//                     "units": "03.30 Hrs.",
//                     "rate": "150000",
//                     "amount": "525000",
//                     "_id": "679758157472133017a2c8e8"
//                 },
//                 {
//                     "description": "GROUND HANDLING CHARGES",
//                     "units": null,
//                     "rate": "120000",
//                     "amount": "120000",
//                     "_id": "679758157472133017a2c8e9"
//                 },
//                 {
//                     "description": "B.L.T CHARGES",
//                     "units": null,
//                     "rate": "0",
//                     "amount": "0",
//                     "_id": "679758157472133017a2c8ea"
//                 },
//                 {
//                     "description": "A.M.E CHARGES",
//                     "units": null,
//                     "rate": "10",
//                     "amount": "10",
//                     "_id": "679758157472133017a2c8eb"
//                 }
//             ],
//             "taxList": [
//                 {
//                     "description": "CGST @ 9%",
//                     "percentage": "9",
//                     "amount": "58051",
//                     "_id": "679758157472133017a2c8e5"
//                 },
//                 {
//                     "description": "SGST/UDST @ 9%",
//                     "percentage": "9",
//                     "amount": "58051",
//                     "_id": "679758157472133017a2c8e6"
//                 },
//                 {
//                     "description": "IGST @ 18%",
//                     "percentage": "0",
//                     "amount": "0",
//                     "_id": "679758157472133017a2c8e7"
//                 }
//             ],
//             "subtotal": 645010,
//             "grandTotal": 761112,
//             "__v": 0
//         },
//         {
//             "header": {
//                 "invoiceHeader": "PRIVATE LIMITED ",
//                 "invoiceImage": "hgkjhv",
//                 "ProformaCompanyName": "MYTHRI MOVIE MAKERS",
//                 "ProformaAddress": "PLOT NO. 330, JUBLI HILLS PAN ROAD NO. 25, ",
//                 "ProformaCity": "HYDERABAD",
//                 "ProformaSate": "TELANGANA",
//                 "ProformaPincode": "500033",
//                 "ProformaGstNo": "36AAWFM8714H1ZO",
//                 "ProformaPanNO": "AAWFM8714H",
//                 "ProformaInvoiceNumber": "RGPAPL/PI-803/12-2024",
//                 "ProformaInvoiceDate": "29-12-2024",
//                 "ProformaPan": "AAICS9057Q",
//                 "ProformaGstNumber": "36AAICS9057Q1ZD",
//                 "ProformaTypeOfAircraft": "B-250 GT (VT-VIN)",
//                 "notes": "In case of any discrepancy contact accounts within 5 days of receiving the bill",
//                 "ProformaSeatingCapasity": 7,
//                 "BookingDateOfJourny": " 29-12-2024",
//                 "BookingSector": "HYDERABAD-CHENNAI-HYDERABAD",
//                 "BookingBillingFlyingTime": " 03.30 Hrs"
//             },
//             "bankDetails": {
//                 "accountName": "RITHWIK GREENPOWER & AVIATION PRIVATE LIMITED",
//                 "bank": " KOTAK MAHINDRA BANK",
//                 "accountNumber": "07452 11990",
//                 "branch": "BANJARA HILLS",
//                 "ifscCode": "KKBK0007461  (NEFT/ RTGS)"
//             },
//             "_id": "67976a0381a736f564f6f373",
//             "invoiceReferenceNo": 21,
//             "chargesList": [
//                 {
//                     "description": "HYDERABAD-CHENNAI-HYDERABAD",
//                     "units": "03.30 Hrs.",
//                     "rate": "150000",
//                     "amount": "525000",
//                     "_id": "67976a0381a736f564f6f374"
//                 },
//                 {
//                     "description": "GROUND HANDLING CHARGES",
//                     "units": null,
//                     "rate": "120000",
//                     "amount": "120000",
//                     "_id": "67976a0381a736f564f6f375"
//                 },
//                 {
//                     "description": "B.L.T CHARGES",
//                     "units": null,
//                     "rate": "0",
//                     "amount": "0",
//                     "_id": "67976a0381a736f564f6f376"
//                 },
//                 {
//                     "description": "A.M.E CHARGES",
//                     "units": null,
//                     "rate": "10",
//                     "amount": "10",
//                     "_id": "67976a0381a736f564f6f377"
//                 }
//             ],
//             "taxList": [
//                 {
//                     "description": "CGST @ 9%",
//                     "percentage": "9",
//                     "amount": "58051",
//                     "_id": "67976a0381a736f564f6f378"
//                 },
//                 {
//                     "description": "SGST/UDST @ 9%",
//                     "percentage": "9",
//                     "amount": "58051",
//                     "_id": "67976a0381a736f564f6f379"
//                 },
//                 {
//                     "description": "IGST @ 18%",
//                     "percentage": "0",
//                     "amount": "0",
//                     "_id": "67976a0381a736f564f6f37a"
//                 }
//             ],
//             "subtotal": 645010,
//             "grandTotal": 761112,
//             "__v": 0
//         },
//         {
//             "header": {
//                 "invoiceHeader": "AIR Craft ",
//                 "invoiceImage": "hgkjhv",
//                 "ProformaCompanyName": "MYTHRI MOVIE MAKERS",
//                 "ProformaAddress": "PLOT NO. 330, JUBLI HILLS PAN ROAD NO. 25, ",
//                 "ProformaCity": "HYDERABAD",
//                 "ProformaSate": "TELANGANA",
//                 "ProformaPincode": "500033",
//                 "ProformaGstNo": "36AAWFM8714H1ZO",
//                 "ProformaPanNO": "AAWFM8714H",
//                 "ProformaInvoiceNumber": "RGPAPL/PI-803/12-2024",
//                 "ProformaInvoiceDate": "29-12-2024",
//                 "ProformaPan": "AAICS9057Q",
//                 "ProformaGstNumber": "36AAICS9057Q1ZD",
//                 "ProformaTypeOfAircraft": "B-250 GT (VT-VIN)",
//                 "notes": "In case of any discrepancy contact accounts within 5 days of receiving the bill",
//                 "ProformaSeatingCapasity": 7,
//                 "BookingDateOfJourny": " 29-12-2024",
//                 "BookingSector": "HYDERABAD-CHENNAI-HYDERABAD",
//                 "BookingBillingFlyingTime": " 03.30 Hrs"
//             },
//             "bankDetails": {
//                 "accountName": "RITHWIK GREENPOWER & AVIATION PRIVATE LIMITED",
//                 "bank": " KOTAK MAHINDRA BANK",
//                 "accountNumber": "07452 11990",
//                 "branch": "BANJARA HILLS",
//                 "ifscCode": "KKBK0007461  (NEFT/ RTGS)"
//             },
//             "_id": "67976a0d81a736f564f6f37d",
//             "invoiceReferenceNo": 22,
//             "chargesList": [
//                 {
//                     "description": "HYDERABAD-CHENNAI-HYDERABAD",
//                     "units": "03.30 Hrs.",
//                     "rate": "150000",
//                     "amount": "525000",
//                     "_id": "67976a0d81a736f564f6f37e"
//                 },
//                 {
//                     "description": "GROUND HANDLING CHARGES",
//                     "units": null,
//                     "rate": "120000",
//                     "amount": "120000",
//                     "_id": "67976a0d81a736f564f6f37f"
//                 },
//                 {
//                     "description": "B.L.T CHARGES",
//                     "units": null,
//                     "rate": "0",
//                     "amount": "0",
//                     "_id": "67976a0d81a736f564f6f380"
//                 },
//                 {
//                     "description": "A.M.E CHARGES",
//                     "units": null,
//                     "rate": "10",
//                     "amount": "10",
//                     "_id": "67976a0d81a736f564f6f381"
//                 }
//             ],
//             "taxList": [
//                 {
//                     "description": "CGST @ 9%",
//                     "percentage": "9",
//                     "amount": "58051",
//                     "_id": "67976a0d81a736f564f6f382"
//                 },
//                 {
//                     "description": "SGST/UDST @ 9%",
//                     "percentage": "9",
//                     "amount": "58051",
//                     "_id": "67976a0d81a736f564f6f383"
//                 },
//                 {
//                     "description": "IGST @ 18%",
//                     "percentage": "0",
//                     "amount": "0",
//                     "_id": "67976a0d81a736f564f6f384"
//                 }
//             ],
//             "subtotal": 645010,
//             "grandTotal": 761112,
//             "__v": 0
//         }
//     ]


  selectedInvoice: any = null; // Stores the selected invoice
  isEditing = false; // Determines whether edit mode is active

  // Field configurations for form rendering
  invoiceFields = [
    { label: 'Company Name', controlName: 'companyName', placeholder: 'Enter company name' },
    { label: 'Date', controlName: 'date', placeholder: 'Enter date' },
    { label: 'City', controlName: 'city', placeholder: 'Enter city' },
    { label: 'invoiceReferenceNo', controlName: 'invoiceReferenceNo', placeholder: 'Enter invoiceReferenceNo' },
  ];

  // Method to select and show an invoice
  selectInvoice(invoice: any) {
    this.selectedInvoice = invoice;
    this.isEditing = false;
    this.activeTab = "Edit"
    this.show = false
  }
  backButton(){
    this.show = true
    this.activeTab = "AllInvoice"
  }
  
  // Method to preview an invoice
  previewInvoice(invoice: any) {
    this.selectedInvoice = invoice;
    this.isEditing = false;
  }

  // Method to edit an invoice
  editInvoice(invoice: any) {
    this.selectedInvoice = invoice;
    this.isEditing = true;
  }
  setTab(tabName: string) {
    this.activeTab = tabName;
    console.log("this.activeTab",this.activeTab);
  }
  

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
 
    if (input.files && input.files[0]) {
      const reader = new FileReader();
     
      reader.onload = () => {
        this.logoUrl = reader.result as string; // Store the image URL
        console.log("Image logoUrl:", this.logoUrl);
      };
 
      reader.readAsDataURL(input.files[0]); // Convert file to base64 URL
    }
  }

  removeLogo(event: Event): void {
    event.preventDefault();
    this.logoUrl = null;
  }

  addChargeItem() {
    this.chargeItems.push({
      description: '',
      rate: 0,
      amount: 0
    });
  }

  addTaxItem(): void {
    this.taxItems.push({ description: '', percentage: 0, amount: 0 });
  }

  calculateTotals() {
    // Loop through each charge item and calculate the amount
    this.chargeItems.forEach(item => {
      // If there are units, convert to hours and calculate the amount
      if (item.units) {
        const unitsInHours = this.convertUnitsToHours(item.units);
        item.amount = unitsInHours * item.rate; // Calculate amount based on rate and hours
      } else if (item.rate) {
        // If no units are provided, calculate amount based only on rate (assuming 1 unit)
        item.amount = item.rate; // If no units, assume 1 unit for calculation
      } else {
        // If no rate or units, set amount to 0
        item.amount = 0;
      }
    });
 
    // Calculate subtotal (sum of all amounts)
    this.subtotal = this.chargeItems.reduce((sum, item) => sum + (item.amount || 0), 0);
 
    // Calculate tax amounts based on subtotal
    this.taxItems.forEach(tax => {
      tax.amount = Math.round(this.subtotal * (tax.percentage / 100));
    });
 
    // Calculate grand total (subtotal + tax amounts)
    this.grandTotal = this.subtotal + this.taxItems.reduce((sum, tax) => sum + tax.amount, 0);
 
    // Update amount in words (you may want to add a proper number to words converter)
    // this.amountInWords = this.numberToWords(this.grandTotal);
    this.amountInWords = this.numberToWordsService.convert(this.grandTotal);
 
    // Log values for debugging (optional)
    console.log("chargeItems", this.chargeItems);
    console.log("taxItems", this.taxItems);
    console.log("subtotal", this.subtotal);
    console.log("grandTotal", this.grandTotal);
    console.log("this.amountInWords",this.amountInWords)
  }
 
 
 
  convertUnitsToHours(units: string | null): number {
    if (!units || units.trim() === '') return 0;
 
    // Clean up the 'Hrs.' part from the input
    const cleanUnits = units.replace(' Hrs.', '').trim();
 
    // Split the units by '.'
    const parts = cleanUnits.split('.');
    if (parts.length !== 2) return 0;  // Ensure there are exactly 2 parts (hours and minutes)
 
    let hours = Number(parts[0]);  // Use 'let' instead of 'const' for reassignment
    let minutes = Number(parts[1]); // Use 'let' instead of 'const' for reassignment
    
    // Validate the parsed values to avoid NaN issues
    if (isNaN(hours) || isNaN(minutes)) return 0; // Return 0 if any value is NaN
 
    // Ensure hours and minutes are within valid ranges
    if (hours > 24) hours = 24; // Max hours can be 24
    if (minutes >= 60) minutes = 59; // Max minutes can be 59
 
    return hours + minutes / 60; // Convert units to decimal hours
  }

  saveInvoice(): void {
    if (this.newInvoiceCreation.valid) {
      console.log('Invoice Saved', this.newInvoiceCreation.value);
      // Implement saving logic here
    } else {
      console.log('Form is invalid');
    }
  }
       
  numbersOnly(event:any) {
    const charCode = event.charCode;
    if (!(charCode >= 48 && charCode <= 57) && ![8, 9, 37, 39, 46].includes(charCode)) {
      event.preventDefault();
    }
  }

  Update(): void {
    if (this.newInvoiceCreation.valid) {
      console.log('Invoice Updated', this.newInvoiceCreation.value);
      // Implement update logic here
    } else {
      console.log('Form is invalid');
    }
  }
   
}
