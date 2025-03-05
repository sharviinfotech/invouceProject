import { Component, OnInit,AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule,ChartComponent } from 'ng-apexcharts';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import {
  ApexChart,
  ApexResponsive
} from "ng-apexcharts";
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ... (Other imports and interfaces remain the same)

export type ChartOptions = {
  series: any;
  chart: any;
  xaxis: any;
  yaxis: any;
  dataLabels: any;
  stroke: any;
  grid: any;
  plotOptions: any;
  legend: any;
  labels: any;
  fill: any;
  tooltip: any;
  responsive: ApexResponsive[];
  colors: any;
};

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  standalone:true,
  imports: [CommonModule, FormsModule, NgApexchartsModule, BsDatepickerModule,NgxSpinnerModule], 
  // providers: [NgxSpinnerService] // ✅ Provide NgxSpinnerService

})
export class DefaultComponent {  // ... (other properties)
  public barChartOptions: Partial<ChartOptions> = {};// Initially hidden
  public pieChartOptions: Partial<ChartOptions> = {};
  public customerChartOptions: Partial<ChartOptions> = {};
  public customerPieChartOptions: Partial<ChartOptions> = {};
  @ViewChild('barChart') barChart: ChartComponent;
  allInvoiceList: any[] = [];
  yearFilteredInvoices: any[] = [];  
  filteredInvoiceList: any[] = [];    
  bsConfig: { dateInputFormat: string; containerClass: string; };
  close: any;
  selectedStatus: string = '';
  totalInvoiceCount: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  rejectedReversedCount: number;
  overdueCount: number;
  customerList: any[];
  customerInvoices: any[] = [];
  selectedCustomer: string = '';
  grandTotalInvoices: number;
  approvedTotal: number;
  rejectedTotal: number;
  pendingTotal: number;
  rejectedReversedTotal: number;
  overdueTotal: number;
  loginData: any;
  AmountReceivedTotal: number;
  AmountReceivedCount: number;
  PaymentPendingTotal: number;
  PaymentPendingCount: number;
  OverAllAmountTotal: number;
  OverAllAmountCount: number;
  TotalPQ: number;
  selectedYear: string = "";
backButtonVisible: boolean = false;
  TotalCountPQ: number;
  tableData: any;
  monthlyBarChartOptions: { series: { name: string; data: number[]; }[]; chart: { type: string; height: number; events: { dataPointSelection: (event: any, chartContext: any, config: any) => void; }; }; plotOptions: { bar: { columnWidth: string; }; }; colors: string[]; xaxis: { categories: string[]; title: { text: string; }; }; yaxis: { title: { text: string; }; }; legend: { position: string; }; };
  filteredTableData: any[];

  
  constructor(
    private service: GeneralserviceService,
    private spinner: NgxSpinnerService,private cdr: ChangeDetectorRef
  ) {
    this.bsConfig = {
      dateInputFormat: 'YYYY-MM-DD',
      containerClass: 'theme-blue',
    };
  }
 
  ngOnInit(): void {
    this.loginData = this.service.getLoginResponse()
    console.log("this.loginData ", this.loginData)
    this.getAllInvoice();
  
  }

  getAllInvoice() {
      this.spinner.show();
      let obj={
        "userActivity":""
    }
      this.service.getAllInvoice(obj).subscribe(
        (res: any) => {
          this.spinner.hide();
          this.allInvoiceList = res.data;
          this.totalAmountAndCount()
          this.filteredInvoiceList = res.data;
          console.log("Fetched Invoice Data:", this.allInvoiceList);
          if(this.allInvoiceList.length>0){
            this.updateBarChart(this.allInvoiceList);
            this.updatePieChart();
            this.updateCustomerPieChart();

          }
        },
        error => {
          this.spinner.hide();
          console.error("Error fetching invoices", error);
        }
      );
  }
  totalAmountAndCount() {
    // Initialize totals and counts
    this.approvedTotal = 0;
    this.rejectedTotal = 0;
    this.pendingTotal = 0;
    this.rejectedReversedTotal = 0;
    this.overdueTotal = 0;
    this.grandTotalInvoices = 0;

    this.approvedCount = 0;
    this.totalInvoiceCount = 0;
    this.rejectedCount = 0;
    this.pendingCount = 0;
    this.rejectedReversedCount = 0;
    this.overdueCount = 0;

    // Separate totals for TAX & PQ calculations
    this.AmountReceivedTotal = 0;
    this.AmountReceivedCount = 0;
    this.TotalPQ = 0;
    this.TotalCountPQ = 0;
    this.PaymentPendingTotal =0
    this.PaymentPendingCount=0
    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    console.log("Current Date:", currentDate);
    console.log("One Month Ago:", oneMonthAgo);

    // Step 1: First process all "PQ" invoices
    const pqInvoices = this.allInvoiceList.filter(invoice => invoice.proformaCardHeaderId === "PQ");
    pqInvoices.forEach(invoice => {
        this.TotalPQ += invoice.grandTotal;
        this.TotalCountPQ++;
    });
    console.log('pqInvoices',pqInvoices)

    // Step 2: Then process all "TAX" invoices separately
    const taxInvoices = this.allInvoiceList.filter(invoice => invoice.status === "Amount Received");
    taxInvoices.forEach(invoice => {
        this.AmountReceivedTotal += invoice.grandTotal;
        this.AmountReceivedCount++;
    });
    console.log('taxInvoices',taxInvoices)

    const approvedlist = this.allInvoiceList.filter(invoice => invoice.status === "Approved");
    console.log('approvedlist',approvedlist)

   // Step 2: Filter invoices where status is "Approved" and pqStatus is "inComplete"
const approvedAndPaymentPending = this.allInvoiceList.filter(invoice => 
  invoice.status === "Approved" && invoice.pqStatus === "inComplete"
);
console.log('approvedAndPaymentPending', approvedAndPaymentPending);

// Step 3: Process the "Approved" and "inComplete" invoices
approvedAndPaymentPending.forEach(invoice => {
  if (invoice.grandTotal && typeof invoice.grandTotal === "number") {
      this.PaymentPendingTotal += invoice.grandTotal;
      this.PaymentPendingCount++;
  }
});
    

    //   const PQLIstTotal = this.allInvoiceList.filter(invoice => invoice.proformaCardHeaderId === "PQ");
    //   PQLIstTotal.forEach(invoice => {
    //   this.grandTotalInvoices += invoice.grandTotal;
    //   this.totalInvoiceCount++;
    // });
    // console.log('PQLIstTotal',PQLIstTotal)

    // Step 3: Now process all invoices (excluding PQ & TAX calculations)
    this.allInvoiceList.forEach(invoice => {
        this.grandTotalInvoices += invoice.grandTotal;
        this.totalInvoiceCount++;

        if (invoice.status === "Approved") {
            this.approvedTotal += invoice.grandTotal;
            this.approvedCount++;
        } else if (invoice.status === "Rejected") {
            this.rejectedTotal += invoice.grandTotal;
            this.rejectedCount++;
        } 
    });

    // // Step 4: Calculate Payment Pending and Overall Amount
    // this.PaymentPendingTotal = this.TotalPQ - this.AmountReceivedTotal;
    // this.PaymentPendingCount = this.TotalCountPQ - this.AmountReceivedCount;

    this.OverAllAmountTotal = this.AmountReceivedTotal + this.PaymentPendingTotal;
    this.OverAllAmountCount = this.AmountReceivedCount + this.PaymentPendingCount;

    // Log Output
    console.log("Total PQ:", this.TotalPQ, "| Count:", this.TotalCountPQ);
    console.log("Amount Received (TAX):", this.AmountReceivedTotal, "| Count:", this.AmountReceivedCount);
    console.log("Payment Pending Total:", this.PaymentPendingTotal, "| Count:", this.PaymentPendingCount);
    console.log("Overall Amount Total:", this.OverAllAmountTotal, "| Count:", this.OverAllAmountCount);

    // Round off the totals
    this.approvedTotal = this.roundToOneDecimal(this.approvedTotal);
    this.rejectedTotal = this.roundToOneDecimal(this.rejectedTotal);
    this.pendingTotal = this.roundToOneDecimal(this.pendingTotal);
    this.rejectedReversedTotal = this.roundToOneDecimal(this.rejectedReversedTotal);
    this.overdueTotal = this.roundToOneDecimal(this.overdueTotal);
    this.grandTotalInvoices = this.roundToOneDecimal(this.grandTotalInvoices);
   const PQList =  this.allInvoiceList.filter((invoice)=>invoice.proformaCardHeaderId === "PQ")
   const TAXList =  this.allInvoiceList.filter((invoice)=>invoice.proformaCardHeaderId === "TAX")
   console.log("PQList",PQList,"TAXList",TAXList);

  
}

roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

// 🔹 Converts "DD-MM-YYYY" to a JavaScript Date object
convertDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('-');
    return new Date(`${year}-${month}-${day}`);
}
// updatePieChart(selectedYear?: string, selectedMonth?: string) {
//   this.spinner.show();

//   setTimeout(() => {
//     let invoicesToProcess = this.allInvoiceList.filter(invoice => {
//       if (!invoice.header?.ProformaInvoiceDate) return false;
//       const dateStr = invoice.header.ProformaInvoiceDate;
//       const [day, month, year] = dateStr.split('-');

//       const isYearMatch = selectedYear ? year === selectedYear : true;
//       const isMonthMatch = selectedMonth ? 
//           new Date(`${year}-${month}-${day}`).toLocaleString('default', { month: 'short' }) === selectedMonth : true;

//       return isYearMatch && isMonthMatch;
//     });

//     if (!invoicesToProcess.length) {
//       console.warn("No invoices available.");
//       this.pieChartOptions.series = [];
//       this.cdr.detectChanges();
//       this.spinner.hide();
//       return;
//     }

//     const statusCounts: { [status: string]: number } = {};
//     invoicesToProcess.forEach(invoice => {
//       const status = invoice.status || "Unknown";
//       statusCounts[status] = (statusCounts[status] || 0) + 1;
//     });

//     const chartLabels = Object.keys(statusCounts);
//     const chartData = Object.values(statusCounts);
//     const statusColors: { [key: string]: string } = {
//       "Approved": "#11db52",
//       "Rejected": "#f93d3d",
//       "Pending": "#ffb020",
//       "Rejected_Reversed": "linear-gradient(135deg, #FFA500, #FF4500)"
//     };
//     const chartColors = chartLabels.map(label => statusColors[label] || "#FFD700");

//     this.pieChartOptions = {
//       series: chartData,
//       chart: {
//         type: "pie",
//         height: 350,
//         events: {
//           dataPointSelection: (event, chartContext, config) => {
//             const selectedStatus = chartLabels[config.dataPointIndex];
//             console.log("Selected Status:", selectedStatus);
//             this.filterTableByStatus(selectedStatus, selectedYear, selectedMonth);
//           }
//         }
//       },
//       labels: chartLabels,
//       colors: chartColors,
//       legend: { position: "bottom" },
//       tooltip: { y: { formatter: (val) => `${val} invoices` } }
//     };

//     this.cdr.detectChanges();
//     this.spinner.hide();
//   }, 500);
// }
updatePieChart(selectedYear?: string, selectedMonth?: string) {
  this.spinner.show();

  setTimeout(() => {
    let invoicesToProcess = this.allInvoiceList.filter(invoice => {
      if (!invoice.header?.ProformaInvoiceDate) return false;
      const dateStr = invoice.header.ProformaInvoiceDate;
      const [day, month, year] = dateStr.split('-');
      const monthName = new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'short' });

      const isYearMatch = selectedYear ? year === selectedYear : true;
      const isMonthMatch = selectedMonth ? monthName === selectedMonth : true;

      return isYearMatch && isMonthMatch;
    });

    if (!invoicesToProcess.length) {
      console.warn("No invoices available.");
      this.pieChartOptions.series = [];
      this.cdr.detectChanges();
      this.spinner.hide();
      return;
    }

    // Define status counts with specific categories
    const statusCounts = { Approved: 0, Pending: 0, Rejected: 0 };

    invoicesToProcess.forEach(invoice => {
      const status = invoice.status || "Unknown";
      if (status === "Approved") statusCounts.Approved++;
      else if (status === "Pending") statusCounts.Pending++;
      else if (status === "Rejected") statusCounts.Rejected++;
    });

    this.pieChartOptions = {
      series: [statusCounts.Approved, statusCounts.Pending, statusCounts.Rejected],
      labels: ["Approved", "Pending", "Rejected"],
      chart: {
        type: "pie",
        height: 350,
        events: {
          dataPointSelection: (event, chartContext, config) => {
            const selectedStatus = ["Approved", "Pending", "Rejected"][config.dataPointIndex];
            console.log("Selected Status:", selectedStatus);
            this.filterTableByStatus(selectedStatus, selectedYear, selectedMonth);
          }
        }
      },
      colors: ["#11db52", "#ffb020", "#f93d3d"],
      legend: { position: "bottom" },
      tooltip: { y: { formatter: (val) => `${val} invoices` } }
    };

    this.cdr.detectChanges();
    this.spinner.hide();
  }, 500);
}





filterTableByStatus(selectedStatus: string, selectedYear?: string, selectedMonth?: string) {
  console.log(`Filtering table by Status: ${selectedStatus}, Year: ${selectedYear}`);

  this.filteredInvoiceList = this.allInvoiceList.filter(invoice => {
    if (!invoice.header?.ProformaInvoiceDate) return false;
    const dateStr = invoice.header.ProformaInvoiceDate;
    const [day, month, year] = dateStr.split('-');

    const isYearMatch = selectedYear ? year === selectedYear : true;
    const isStatusMatch = invoice.status === selectedStatus;

    return isYearMatch && isStatusMatch;
  });

  console.log("Filtered invoices after pie selection:", this.filteredInvoiceList);

  // Trigger change detection to update the UI
  this.cdr.detectChanges();
}




filterByYear(selectedYear: string) {
  console.log("Selected Year:", selectedYear);
  this.selectedYear = selectedYear; // Store selected year
  this.backButtonVisible = true; // Show back button

  // Filter invoices by selected year
  this.filteredInvoiceList = this.allInvoiceList.filter(invoice => {
    if (!invoice.header?.ProformaInvoiceDate) return false;
    const dateStr = invoice.header.ProformaInvoiceDate;
    const [day, month, year] = dateStr.split('-');
    return year === selectedYear;
  });

  if (!this.filteredInvoiceList.length) {
    console.warn("No invoices found for the selected year.");
    this.pieChartOptions.series = [];
    this.filteredInvoiceList = []; // Ensure it's cleared
    this.cdr.detectChanges();
    return;
  }

  // Update charts with filtered data
  this.updatePieChart(selectedYear);
  this.updateMonthlyBarChart(selectedYear);
}
updateTable(selectedYear: string, selectedMonth: string, selectedStatus: string) {
  this.filteredTableData = this.allInvoiceList.filter(invoice => {
      if (!invoice.header?.ProformaInvoiceDate) return false;
      const dateStr = invoice.header.ProformaInvoiceDate;
      const [day, month, year] = dateStr.split('-');
      const monthName = new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'short' });

      return year === selectedYear && monthName === selectedMonth && invoice.status === selectedStatus;
  });

  this.cdr.detectChanges();
}


goBackToYearlyView() {
  this.selectedYear = "";
  this.backButtonVisible = false;
  this.updateBarChart(this.allInvoiceList);
}



updateBarChart(data: any[]) {
  this.spinner.show();

  const yearlyStatusCounts = this.calculateYearlyStatusCounts(data);
  if (Object.keys(yearlyStatusCounts).length === 0) return;

  const years = Object.keys(yearlyStatusCounts).sort();
  const seriesData = years.map(year => yearlyStatusCounts[year]);

  this.barChartOptions = {
    series: [{ name: "Invoices", data: seriesData }],
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
      toolbar: { show: true },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selectedYear = years[config.dataPointIndex];
          console.log("Year selected:", selectedYear);
          this.filterByYear(selectedYear);
          this.updateMonthlyBarChart(selectedYear); // **Monthly chart ni update cheyyataniki call chestunnam**
        }
      }
    },
    plotOptions: { bar: { columnWidth: "20%" } },
    colors: ["#007BFF"],
    xaxis: { categories: years, title: { text: "Year" } },
    yaxis: { title: { text: "Invoice Count" } },
    legend: { position: 'bottom' }
  };

  setTimeout(() => {
    this.spinner.hide();
    this.updatePieChart(); // **Pie chart lo overall data load chestunnam**
  }, 200);
}

updateMonthlyBarChart(selectedYear: string) {
  this.spinner.show();

  const filteredInvoices = this.allInvoiceList.filter(invoice => {
      if (!invoice.header?.ProformaInvoiceDate) return false;
      const dateStr = invoice.header.ProformaInvoiceDate;
      const [day, month, year] = dateStr.split('-');
      return year === selectedYear;
  });

  if (!filteredInvoices.length) {
      console.warn("No invoices found for selected year.");
      this.barChartOptions.series = [];
      this.cdr.detectChanges();
      this.spinner.hide();
      return;
  }

  // **Initialize Status Count Object**
  const monthlyStatusCounts: { [month: string]: { [status: string]: number } } = {};

  filteredInvoices.forEach(invoice => {
      const dateStr = invoice.header.ProformaInvoiceDate;
      const [day, month, year] = dateStr.split('-');
      const monthName = new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'short' });

      const status = invoice.status || "Unknown";

      if (!monthlyStatusCounts[monthName]) {
          monthlyStatusCounts[monthName] = { Approved: 0, Pending: 0, Rejected: 0 };
      }

      if (status === "Approved") monthlyStatusCounts[monthName].Approved++;
      else if (status === "Pending") monthlyStatusCounts[monthName].Pending++;
      else if (status === "Rejected") monthlyStatusCounts[monthName].Rejected++;
  });

  const months = Object.keys(monthlyStatusCounts);
  const approvedData = months.map(month => monthlyStatusCounts[month].Approved);
  const pendingData = months.map(month => monthlyStatusCounts[month].Pending);
  const rejectedData = months.map(month => monthlyStatusCounts[month].Rejected);

  this.barChartOptions = {
      series: [
          { name: "Approved", data: approvedData },
          { name: "Pending", data: pendingData },
          { name: "Rejected", data: rejectedData },
      ],
      chart: {
          type: "bar",
          height: 350,
          stacked: false,
          toolbar: { show: true },
          events: {
              dataPointSelection: (event, chartContext, config) => {
                  const selectedMonth = months[config.dataPointIndex];
                  const selectedStatus = config.seriesIndex === 0 ? "Approved" :
                                        config.seriesIndex === 1 ? "Pending" :
                                        "Rejected";
                  console.log("Month selected:", selectedMonth, "Status:", selectedStatus);

                  // Call methods to update Pie Chart & Table
                  this.updatePieChart(selectedYear, selectedMonth);
                  this.updateTable(selectedYear, selectedMonth, selectedStatus);
              }
          }
      },
      plotOptions: { bar: { columnWidth: "20%" } },
      colors: ["#11db52", "#ffb020", "#f93d3d"],  // Green, Orange, Red
      xaxis: { categories: months, title: { text: "Month" } },
      yaxis: { title: { text: "Invoice Count" } },
      legend: { position: 'bottom' }
  };

  setTimeout(() => {
      this.spinner.hide();
  }, 200);
}


filterByMonth(selectedYear: string, selectedMonth: string) {
  console.log(`Filtering table by Year: ${selectedYear}, Month: ${selectedMonth}`);

  this.filteredInvoiceList = this.allInvoiceList.filter(invoice => {
      if (!invoice.header?.ProformaInvoiceDate) return false;
      const dateStr = invoice.header.ProformaInvoiceDate;
      const [day, month, year] = dateStr.split('-');

      const monthName = new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'short' });
      return year === selectedYear && monthName === selectedMonth;
  });

  console.log("Filtered invoices for month:", this.filteredInvoiceList);

  // **Pie Chart Data Update**
  this.updatePieChart(selectedYear);

  // **Change Detection Trigger**
  this.cdr.detectChanges();
}


// Function to calculate yearly invoice counts
calculateYearlyStatusCounts(invoices: any[]): { [year: string]: number } {
  const yearlyStatusCounts: { [year: string]: number } = {};

  invoices.forEach(invoice => {
      if (!invoice.header?.ProformaInvoiceDate) return;

      const dateStr = invoice.header.ProformaInvoiceDate;
      const [day, month, year] = dateStr.split('-');
      const date = new Date(`${year}-${month}-${day}`);

      if (isNaN(date.getTime())) return;

      const yearStr = date.getFullYear().toString();
      yearlyStatusCounts[yearStr] = (yearlyStatusCounts[yearStr] || 0) + 1;
  });

  return yearlyStatusCounts;
}










  updateCustomerPieChart() {
    const customerCounts: { [key: string]: number } = {}; // Object to store counts

    // Count occurrences of each customer
    this.allInvoiceList.forEach((invoice) => {
      const customerName = invoice.header?.ProformaCustomerName?.trim() || "Unknown"; // Trim spaces, handle missing names
      customerCounts[customerName] = (customerCounts[customerName] || 0) + 1;
    });
  
 
    // Extract labels (customer names) and series data (invoice counts)
    const customerNames = Object.keys(customerCounts);
    const invoiceCounts = Object.values(customerCounts);
  
    this.customerChartOptions = { 
      series: invoiceCounts,  // Values for Pie Chart
      chart: {
        type: "donut",
        height: 350,
        events: {
          dataPointSelection: (event, chartContext, config) => {
            const selectedCustomer = customerNames[config.dataPointIndex]; // Get clicked customer name
            this.filterTableByCustomer(selectedCustomer); // Call filter function
          }
        }
      },
      labels: customerNames,  // Labels for Pie Chart
      colors: ["#FF4560", "#008FFB", "#00E396", "#FEB019", "#775DD0"], // Custom colors
      legend: {
        position: "bottom"
      }
    };
  
    console.log("Pie Chart Data:", this.pieChartOptions);
    this.cdr.detectChanges(); // Ensure UI updates
  }
  filterTableByCustomer(customerName: string) {
    if (!customerName) {
      this.filteredInvoiceList = [...this.allInvoiceList]; // Show all data
    } else {
      this.filteredInvoiceList = this.allInvoiceList.filter(
        (invoice) => invoice.header?.ProformaCustomerName?.trim() === customerName
      );
    }
  
    this.cdr.detectChanges();
  }
  
  
  OnClickCard(type){
    console.log("type",type)


    if(type == '1'){
      this.filteredInvoiceList = this.allInvoiceList
    }
    else if(type == '2'){
      const approvedlist = this.allInvoiceList.filter(invoice => invoice.status === "Approved");
      console.log('approvedlist',approvedlist)
      this.filteredInvoiceList = approvedlist
    }
    else if(type == '3'){
      const rejectedlist = this.allInvoiceList.filter(invoice => invoice.status === "Rejected");
      console.log('rejectedlist',rejectedlist)
      this.filteredInvoiceList = rejectedlist
    }
    else if(type == '4'){
      const ReceivedList = this.allInvoiceList.filter(invoice => invoice.status === "Amount Received");
      console.log('ReceivedList',ReceivedList)
      this.filteredInvoiceList = ReceivedList
    }
    else if(type == '5'){
      const PaymentPendingList = this.allInvoiceList.filter(invoice => invoice.status === "Approved" && invoice.pqStatus === "inComplete");
      console.log('PaymentPendingList',PaymentPendingList)
      this.filteredInvoiceList = PaymentPendingList
    }
    else if(type == '6'){
      const ReceivedList = this.allInvoiceList.filter(invoice => invoice.status === "Amount Received");
      const PaymentPendingList = this.allInvoiceList.filter(invoice => invoice.status === "Approved" && invoice.pqStatus === "inComplete");

      this.filteredInvoiceList = [...ReceivedList,...PaymentPendingList]
    }
    
    console.log("OnClickCard this.filteredInvoiceList",this.filteredInvoiceList)

  }

  
  
}