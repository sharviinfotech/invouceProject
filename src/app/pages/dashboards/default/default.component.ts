import { ApexOptions } from 'apexcharts';
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
  dataLabels: ApexDataLabels;
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
  monthlyBarChartOptions: Partial<ApexOptions> = {};

  @ViewChild('barChart') barChart: ChartComponent;
  allInvoiceList: any[] = [];
  yearFilteredInvoices: any[] = [];  
  filteredInvoiceList: any[] = []; 
  selectedYear: string = '';    
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
  TotalCountPQ: number;
  tableData: any;
  monthlyPieChartOptions: {
    series: number[];
    chart: {
      type: string;
      height: number;
      events?: { 
        dataPointSelection?: (event: any, chartContext: any, config: any) => void 
      };
    };
    labels: string[];
    colors: string[];
    legend: { position: string };
  };
    monthlyCardDisplay: boolean=false;
  
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

roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

// 🔹 Converts "DD-MM-YYYY" to a JavaScript Date object
convertDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('-');
    return new Date(`${year}-${month}-${day}`);
}
// updatePieChart(selectedYear?: string) {
//   this.spinner.show();

//   setTimeout(() => {
//     let invoicesToProcess = this.allInvoiceList.filter(invoice => {
//       if (!invoice.header?.ProformaInvoiceDate) return false;
//       const dateStr = invoice.header.ProformaInvoiceDate;
//       const [day, month, year] = dateStr.split('-');
//       return selectedYear ? year === selectedYear : true;
//     });

//     if (!invoicesToProcess.length) {
//       console.warn("No invoices available.");
//       this.pieChartOptions.series = [];
//       this.cdr.detectChanges();
//       this.spinner.hide();
//       return;
//     }

//     // Count invoices by status
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
//             this.filterTableByStatus(selectedStatus, selectedYear);
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
goBackToYearChart() {
  this.selectedYear = null;  // Reset the selected year
  this.monthlyCardDisplay = false; // Hide the monthly charts
}

updatePieChart(selectedYear?: string) {
  this.spinner.show();

  setTimeout(() => {
    let invoicesToProcess = this.allInvoiceList.filter(invoice => {
      if (!invoice.header?.ProformaInvoiceDate) return false;
      const [day, month, year] = invoice.header.ProformaInvoiceDate.split('-');
      return selectedYear ? year === selectedYear : true;
    });

    if (!invoicesToProcess.length) {
      console.warn("No invoices available.");
      this.pieChartOptions.series = [];
      this.cdr.detectChanges();
      this.spinner.hide();
      return;
    }

    // Count invoices by status
    const statusCounts: { [status: string]: number } = {};
    invoicesToProcess.forEach(invoice => {
      const status = invoice.status || "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const chartLabels = Object.keys(statusCounts);
    const chartData = Object.values(statusCounts);
    const statusColors: { [key: string]: string } = {
      "Approved": "#11db52",
      "Rejected": "#f93d3d",
      "Pending": "#ffb020",
      "Amount Received": "#008000"
    };
    const chartColors = chartLabels.map(label => statusColors[label] || "#FFD700");

    this.pieChartOptions = {
      series: chartData,
      chart: {
        type: "pie",
        height: 350,
        events: {
          dataPointSelection: (event, chartContext, config) => {
            const selectedStatus = chartLabels[config.dataPointIndex];
            console.log("Selected Status:", selectedStatus);
            this.filterTableByStatus(selectedStatus, selectedYear);
          }
        }
      },
      labels: chartLabels,
      colors: chartLabels.map(label => statusColors[label] || "#FFD700"),
      legend: { position: "bottom" }
    };

    this.cdr.detectChanges();
    this.spinner.hide();
  }, 500);
}


filterTableByStatus(selectedStatus: string, selectedYear?: string) {
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

  // Update Pie Chart with filtered data
  this.updatePieChart(selectedYear);
}


updateBarChart(data: any[]) {
  this.spinner.show();

  const yearlyStatusCounts = this.calculateYearlyStatusCounts(data);
  console.log("updatebarchart data.....",data)
  if (!Object.keys(yearlyStatusCounts).length) return;

  const years = Object.keys(yearlyStatusCounts).sort();
  const seriesData = years.map(year => yearlyStatusCounts[year]);

  this.barChartOptions = {
    series: [{ name: "Invoices", data: seriesData }],
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: true },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selectedYear = years[config.dataPointIndex];
          console.log("Year selected:", selectedYear);
          this.filterByYear(selectedYear);
          setTimeout(() => {
            this.updateMonthlyBarChart(selectedYear); // Load Monthly Data
          }, 1000);
          
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

//Function  to calculate yearly amount
// Function to calculate yearly invoice counts
// updateBarChart(data: any[]) {
//   this.spinner.show();

//   // Calculate yearly grand total
//   const yearlyGrandTotal = this.calculateYearlyGrandTotal(data);
//   console.log("updatebarchart data.....", data);

//   if (!Object.keys(yearlyGrandTotal).length) return;

//   const years = Object.keys(yearlyGrandTotal).sort();
//   const seriesData = years.map(year => yearlyGrandTotal[year]);

//   this.barChartOptions = {
//     series: [{ name: "Grand Total", data: seriesData }],
//     chart: {
//       type: "bar",
//       height: 350,
//       toolbar: { show: true },
//       events: {
//         dataPointSelection: (event, chartContext, config) => {
//           const selectedYear = years[config.dataPointIndex];
//           console.log("Year selected:", selectedYear);
//           this.filterByYear(selectedYear);
//           this.updateMonthlyBarChart(selectedYear); // Load Monthly Data
          
//           // Reset all bar styles
//           const bars = document.querySelectorAll(".apexcharts-bar-area");
//           bars.forEach((bar) => {
//             (bar as HTMLElement).style.stroke = "none"; // Remove previous borders
//             (bar as HTMLElement).style.strokeWidth = "0";
//           });

//           // Highlight the selected bar
//           const selectedBar = document.querySelector(
//             `.apexcharts-bar-area[j="${config.dataPointIndex}"]`
//           );
//           if (selectedBar) {
//             (selectedBar as HTMLElement).style.stroke = "red"; // Add red border
//             (selectedBar as HTMLElement).style.strokeWidth = "2px";
//           }
//         }
//       }
//     },
//     plotOptions: { bar: { columnWidth: "20%" } },
//     colors: ["#28a745"], // Green color for grand total
//     xaxis: { categories: years, title: { text: "Year" } },
//     yaxis: { title: { text: "Grand Total (₹)" } },
//     legend: { position: 'bottom' }
//   };

//   setTimeout(() => {
//     this.spinner.hide();
//     this.updatePieChart(); // Load overall data initially
//   }, 200);
// }


// calculateYearlyGrandTotal(data: any[]) {
//   return data.reduce((acc, invoice) => {
//     const year = new Date(invoice.header.ProformaInvoiceDate).getFullYear();
//     const grandTotal = invoice.grandTotal || 0;
    
//     acc[year] = (acc[year] || 0) + grandTotal;
//     return acc;
//   }, {});
// }


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
resetPieChart() {
  console.log('Resetting Pie Chart...');
  this.monthlyPieChartOptions = null; // Remove the pie chart
  this.cdr.detectChanges(); // Force UI update
}

updateMonthlyBarChart(selectedYear: string) {
  this.selectedYear = selectedYear;
  this.monthlyCardDisplay = true;

  // Initialize arrays to store totals and counts per month
  const monthlyApprovedTotal = new Array(12).fill(0);
  const monthlyRejectedTotal = new Array(12).fill(0);
  const monthlyPendingTotal = new Array(12).fill(0);
  const monthlyAmountReceivedTotal = new Array(12).fill(0);

  // const monthlyApprovedCount = new Array(12).fill(0);
  // const monthlyRejectedCount = new Array(12).fill(0);
  // const monthlyPendingCount = new Array(12).fill(0);
  // const monthlyAmountReceivedCount = new Array(12).fill(0);

  this.allInvoiceList.forEach(invoice => {
    if (!invoice.header?.ProformaInvoiceDate || !invoice.grandTotal) return;
    
    const [day, month, year] = invoice.header.ProformaInvoiceDate.split('-');
    if (year === selectedYear) {
      const monthIndex = parseInt(month, 10) - 1;
      const grandTotal = parseFloat(invoice.grandTotal).toFixed(1); // Formatting to 1 decimal place
      console.log(`Month: ${month}, Status: ${invoice.status}, GrandTotal: ${grandTotal}`);
      switch (invoice.status) {
        case 'Approved':
          monthlyApprovedTotal[monthIndex] += grandTotal;
          // monthlyApprovedCount[monthIndex] += 1;
          break;
        case 'Rejected':
          monthlyRejectedTotal[monthIndex] += grandTotal;
          // monthlyRejectedCount[monthIndex] += 1;
          break;
        case 'Pending':
          monthlyPendingTotal[monthIndex] += grandTotal;
          // monthlyPendingCount[monthIndex] += 1;
          break;
        case 'Amount Received':
          monthlyAmountReceivedTotal[monthIndex] += grandTotal;
          // monthlyAmountReceivedCount[monthIndex] += 1;
          break;
        default:
          break;
      }
    }
  });

  // Now, update the chart data
  this.monthlyBarChartOptions = {
    series: [
      { name: 'Approved ', data: monthlyApprovedTotal },
      { name: 'Rejected ', data: monthlyRejectedTotal },
      { name: 'Pending ', data: monthlyPendingTotal },
      { name: 'Amount Received ', data: monthlyAmountReceivedTotal }
    ],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: true },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selectedMonthIndex = config.dataPointIndex; // Get month index (0-based)
          
          console.log('Month selected:', selectedMonthIndex + 1);
          console.log(`Approved:  ₹${monthlyApprovedTotal[selectedMonthIndex]}`);
          console.log(`Rejected:  ₹${monthlyRejectedTotal[selectedMonthIndex]}`);
          console.log(`Pending: ₹${monthlyPendingTotal[selectedMonthIndex]}`);
          console.log(`Amount Received: ₹${monthlyAmountReceivedTotal[selectedMonthIndex]}`);
      
          // Ensure the Pie Chart updates, even if clicking on empty space
          this.updateMonthlyPieChart(this.selectedYear, selectedMonthIndex + 1);
          this.updateMonthlyTable(this.selectedYear, selectedMonthIndex + 1);
      
          // ✅ **Highlight the entire month column, even if an empty space is clicked**
          const barsInSelectedMonth = document.querySelectorAll(
            `.apexcharts-bar-series path[data:apexcharts-data-point-index="${selectedMonthIndex}"]`
          );
      
          // Remove previous highlights
          document.querySelectorAll(".apexcharts-bar-series path").forEach((bar) => {
            (bar as HTMLElement).style.stroke = "none";
            (bar as HTMLElement).style.strokeWidth = "0";
            (bar as HTMLElement).style.fillOpacity = "1";
          });
      
          // Highlight the entire month column
          barsInSelectedMonth.forEach((bar) => {
            (bar as HTMLElement).style.stroke = "red"; // Add red border
            (bar as HTMLElement).style.strokeWidth = "2px";
            (bar as HTMLElement).style.fillOpacity = "0.7"; // Dim effect for visibility
          });
        }
      }

    },
    plotOptions: {
      bar: {
        columnWidth: '100%',
      }
    },
    dataLabels: {
      enabled: false,
      style: { fontSize: "14px", fontWeight: "bold", colors: ["#000"] }
    },
    colors: ['#11db52', '#f93d3d', '#ffb020', '#008000'],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      title: { text: 'Months' }
    },
    yaxis: {
      title: { text: 'Grand Total (₹)' },
      labels: {
        formatter: function (value) {
          return value.toFixed(1); // Ensures only one decimal place
        }
      }
    },
    
    
    legend: {
      position: 'bottom'
    },
    states: {
      active: {
        filter: {
          type: 'darken',
          value: 0.8
        }
      }
    }
  };


  this.resetPieChart();
  this.cdr.detectChanges();
}

updateMonthlyPieChart(selectedYear: string, selectedMonth?: number) {
  console.log('Updating Pie Chart for:', { selectedYear, selectedMonth });

  // Filter invoices based on the selected year and month
  const invoicesToProcess = this.allInvoiceList.filter(invoice => {
    if (!invoice.header?.ProformaInvoiceDate) return false;
    const [day, month, year] = invoice.header.ProformaInvoiceDate.split('-');
    return (
      selectedYear === year &&
      (!selectedMonth || parseInt(month, 10) === selectedMonth)
    );
  });

  // Initialize status counts and total amounts
  const statusData: { [status: string]: { count: number; totalAmount: number } } = {};

  invoicesToProcess.forEach(invoice => {
    const status = invoice.status || 'Unknown';
    const grandTotal = invoice.grandTotal ? parseFloat(invoice.grandTotal) : 0;

    if (!statusData[status]) {
      statusData[status] = { count: 0, totalAmount: 0 };
    }
    
    statusData[status].count += 1;
    statusData[status].totalAmount += grandTotal;
  });

  // Define colors for each status
  const statusColors: { [key: string]: string } = {
    'Approved': '#11db52',
    'Rejected': '#f93d3d',
    'Pending': '#ffb020',
    'Amount Received': '#008000'
  };

  // Prepare labels with count and total amount
  const labels = Object.keys(statusData).map(status => {
    return `${status} (Count: ${statusData[status].count}, ₹${statusData[status].totalAmount.toFixed(1)})`;
  });

  // Reset pie chart before updating
  this.monthlyPieChartOptions = null;
  this.cdr.detectChanges(); // Force UI update

  // Update with new data
  this.monthlyPieChartOptions = {
    series: Object.values(statusData).map(data => data.totalAmount), // Using Grand Total
    chart: {
      type: 'pie',
      height: 350,
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selectedIndex = config.dataPointIndex;
          const selectedStatus = Object.keys(statusData)[selectedIndex];
  
          console.log(`Pie Chart Clicked: ${selectedStatus}`);
  
          // Call the table update function with the clicked status
          this.updateMonthlyTable(selectedYear, selectedMonth, selectedStatus);
        }
      }
    },
    labels: labels, // Updated labels with count and grand total
    colors: Object.keys(statusData).map(status => statusColors[status] || "#CCCCCC"),
    legend: { position: 'bottom' }
  };
  

  this.cdr.detectChanges(); // Apply changes
}


updateMonthlyTable(selectedYear: string, selectedMonth?: number, selectedStatus?: string) {
  this.filteredInvoiceList = this.allInvoiceList.filter(invoice => {
    if (!invoice.header?.ProformaInvoiceDate) return false;
    const [day, month, year] = invoice.header.ProformaInvoiceDate.split('-');

    return (
      selectedYear === year &&
      (!selectedMonth || parseInt(month, 10) === selectedMonth) &&
      (!selectedStatus || invoice.status === selectedStatus) // Filter by status if provided
    );
  });

  this.cdr.detectChanges();
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


