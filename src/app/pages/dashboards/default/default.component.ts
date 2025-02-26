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
  TotalCountPQ: number;
  tableData: any;

  
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

    // Step 4: Calculate Payment Pending and Overall Amount
    this.PaymentPendingTotal = this.TotalPQ - this.AmountReceivedTotal;
    this.PaymentPendingCount = this.TotalCountPQ - this.AmountReceivedCount;

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
   console.log("PQList",PQList,"TAXList",TAXList)

}

roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

// 🔹 Converts "DD-MM-YYYY" to a JavaScript Date object
convertDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('-');
    return new Date(`${year}-${month}-${day}`);
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
                  this.handleBarClick(years, config.dataPointIndex);
                  const selectedYear = years[config.dataPointIndex];
                  console.log("Year selected:", selectedYear);
                  this.filterByYear(selectedYear);
          
                  // Reset all bar styles
                  const bars = document.querySelectorAll(".apexcharts-bar-area");
                  bars.forEach((bar) => {
                    (bar as HTMLElement).style.stroke = "none"; // Remove previous borders
                    (bar as HTMLElement).style.strokeWidth = "0";
                  });
          
                  // Highlight the selected bar
                  const selectedBar = document.querySelector(
                    `.apexcharts-bar-area[j="${config.dataPointIndex}"]`
                  );
                  if (selectedBar) {
                    (selectedBar as HTMLElement).style.stroke = "red"; // Add red border
                    (selectedBar as HTMLElement).style.strokeWidth = "2px";
                  }
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
      this.updatePieChart(); // Load overall data initially
  }, 200);
}

handleBarClick(years: string[], index: number) {
  const selectedYear = years[index];
  console.log("Year selected:", selectedYear);
  this.filterByYear(selectedYear);

  // Reset all bar styles
  const bars = document.querySelectorAll(".apexcharts-bar-area");
  bars.forEach((bar) => {
      (bar as HTMLElement).style.stroke = "none";
      (bar as HTMLElement).style.strokeWidth = "0";
  });

  // Highlight the selected bar
  const selectedBar = document.querySelector(`.apexcharts-bar-area[j="${index}"]`);
  if (selectedBar) {
      (selectedBar as HTMLElement).style.stroke = "red";
      (selectedBar as HTMLElement).style.strokeWidth = "2px";
  }
}

// Function to filter and update table and pie chart by selected year
filterByYear(selectedYear: string) {
  console.log("Selected Year:", selectedYear);

  // Filter invoices for the selected year
  const filteredInvoices = this.allInvoiceList.filter(invoice => invoice.year === selectedYear);

  if (!filteredInvoices.length) {
      console.warn("No invoices found for the selected year.");
      this.pieChartOptions.series = [];
      this.tableData = []; // Clear table data if no records found
      this.cdr.detectChanges();
      return;
  }
  

  // Update Pie Chart
  this.updatePieChart(selectedYear);

  // Update Table Data
  this.updateTableData(filteredInvoices);
}


// Function to update the pie chart based on the selected year or all data initially
updatePieChart(selectedYear?: string) {
  this.spinner.show();

  setTimeout(() => {
      let invoicesToProcess = this.allInvoiceList;

      if (selectedYear) {
          invoicesToProcess = this.allInvoiceList.filter(invoice => invoice.year === selectedYear);
      }

      const statusCounts: { [status: string]: number } = {};

      if (!invoicesToProcess || invoicesToProcess.length === 0) {
          console.warn("No invoices available.");
          this.pieChartOptions.series = [];
          this.cdr.detectChanges();
          this.spinner.hide();
          return;
      }

      invoicesToProcess.forEach(invoice => {
          const status = invoice.status || "Unknown";
          statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      console.log("Pie Chart Data:", statusCounts);

      if (Object.keys(statusCounts).length === 0) {
          console.warn("No status data found for pie chart.");
          this.pieChartOptions.series = [];
          this.cdr.detectChanges();
          this.spinner.hide();
          return;
      }

      // Define color mapping for statuses
      const statusColors: { [key: string]: string } = {
          "Approved": "#11db52",
          "Rejected": "#f93d3d",
          "Pending": "#ffb020",
          "Rejected_Reversed": "linear-gradient(135deg, #FFA500, #FF4500)"
      };

      const chartLabels = Object.keys(statusCounts);
      const chartColors = chartLabels.map(label => statusColors[label] || "#FFD700");

      this.pieChartOptions = {
          series: Object.values(statusCounts),
          chart: {
              type: "pie",
              height: 350,
              events: {
                  dataPointSelection: (event, chartContext, config) => {
                      const selectedStatus = chartLabels[config.dataPointIndex];
                      console.log("Selected Status:", selectedStatus);
                      this.filterTableByStatus(selectedStatus);
                  }
              }
          },
          labels: chartLabels,
          colors: chartColors,
          legend: { position: "bottom" },
          tooltip: { y: { formatter: (val) => `${val} invoices` } }
      };

      this.updateTableData(invoicesToProcess);
      this.cdr.detectChanges();
      this.spinner.hide();
  }, 500);
}

// Function to update table data
updateTableData(filteredInvoices) {
  this.tableData = filteredInvoices;
  this.cdr.detectChanges();
}

// Function to filter the table based on the selected status
filterTableByStatus(selectedStatus: string) {
  this.filteredInvoiceList = this.allInvoiceList.filter(invoice => invoice.status?.trim().toLowerCase() === selectedStatus.trim().toLowerCase());
  console.log("Filtered Table Data by Status:", this.filteredInvoiceList);
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
  
  


  
  
}