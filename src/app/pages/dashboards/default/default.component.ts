import { Component, OnInit,AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule,ChartComponent } from 'ng-apexcharts';
import {
  ApexChart,
  ApexResponsive
} from "ng-apexcharts";
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ... (Other imports and interfaces remain the same)

export type ChartOptions = {
  series: any;
  chart: ApexChart;
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
  imports: [CommonModule, FormsModule, NgApexchartsModule, BsDatepickerModule], 
})
export class DefaultComponent {  // ... (other properties)
  public barChartOptions: Partial<ChartOptions> = {};// Initially hidden
  public pieChartOptions: Partial<ChartOptions> = {};
  
  @ViewChild('barChart') barChart: ChartComponent;
  allInvoiceList: any[] = [];
  bsConfig: { dateInputFormat: string; containerClass: string; };
  close: any;

  constructor(
    private service: GeneralserviceService,
    private spinner: NgxSpinnerService,
  ) {
    this.bsConfig = {
      dateInputFormat: 'YYYY-MM-DD',
      containerClass: 'theme-blue',
    };
  }
 

  ngOnInit(): void {
    this.getAllInvoice();
  }

  getAllInvoice() {
    this.spinner.show();
    this.service.getAllInvoice().subscribe(
      (res: any) => {
        this.spinner.hide();
        this.allInvoiceList = res.data;
        console.log("Fetched Invoice Data:", this.allInvoiceList); // Debugging
        this.updateBarChart(this.allInvoiceList);
      },
      error => {
        this.spinner.hide();
        console.error("Error fetching invoices", error); // Debugging
      }
    );
  }
  
  updateBarChart(data: any[]) {
    const yearlyStatusCounts = this.calculateYearlyStatusCounts(data);
  
    if (Object.keys(yearlyStatusCounts).length === 0) {
      console.warn("No valid data for chart.");
      return;
    }
  
    const years = Object.keys(yearlyStatusCounts).sort();
    const seriesData = years.map(year => yearlyStatusCounts[year]);
  
    console.log("Chart Data:", seriesData);
  
    this.barChartOptions = {
      series: [{
        name: "Invoices",
        data: seriesData
      }],
      chart: {
        type: "bar",
        height: 350,
        stacked: false,
        toolbar: { show: true },
        events: {
          dataPointSelection: (event, chartContext, config) => {
            const selectedYear = years[config.dataPointIndex];
            console.log("Year selected:", selectedYear);
            this.updatePieChart(selectedYear);
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 10,
        }
      },
      xaxis: {
        categories: years,
        title: { text: "Year" }
      },
      yaxis: {
        title: { text: "Invoice Count" }
      },
      tooltip: {
        y: { formatter: (val) => `${val} invoices` }
      },
      legend: { position: 'bottom' }
    };
  }
  

  calculateYearlyStatusCounts(invoices: any[]): { [year: string]: number } {
    const yearlyStatusCounts: { [year: string]: number } = {};
  
    invoices.forEach(invoice => {
      // Check if the necessary fields exist before proceeding
      if (!invoice.header || !invoice.header.ProformaInvoiceDate) {
        console.warn("Missing ProformaInvoiceDate in invoice:", invoice); // Debugging
        return;
      }
  
      // Parse the date in DD-MM-YYYY format
      const dateStr = invoice.header.ProformaInvoiceDate;
      const [day, month, year] = dateStr.split('-'); // Split the date into day, month, and year
      const date = new Date(`${year}-${month}-${day}`); // Create a new Date object in YYYY-MM-DD format
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid ProformaInvoiceDate:", dateStr); // Debugging
        return;
      }
  
      const yearStr = date.getFullYear().toString();
  
      // Initialize year if not present in the object
      if (!yearlyStatusCounts[yearStr]) {
        yearlyStatusCounts[yearStr] = 0;
      }
  
      // Count the invoices per year
      yearlyStatusCounts[yearStr] += 1;
    });
  
    console.log("Yearly Status Counts:", yearlyStatusCounts); // Debugging
    return yearlyStatusCounts;
  }
  

  updatePieChart(selectedYear: string) {
    console.log("Selected Year:", selectedYear);
  
    const filteredInvoices = this.allInvoiceList.filter(invoice => {
      const dateStr = invoice.header?.ProformaInvoiceDate;
      if (!dateStr) {
        console.warn("Skipping invoice due to missing date:", invoice);
        return false;
      }
  
      console.log("Raw Date String:", dateStr);
  
      // Extract year from DD-MM-YYYY format
      const [day, month, year] = dateStr.split('-');
      console.log(`Extracted Year: ${year} from ${dateStr}`);
  
      return year === selectedYear; // Compare with selected year
    });
  
    console.log("Filtered Invoices for Year", selectedYear, ":", filteredInvoices);
  
    if (filteredInvoices.length === 0) {
      console.warn("No invoices found for the selected year.");
      return;
    }
  
    // Pass filtered invoices to calculateStatusCounts
    const statusCounts = this.calculateStatusCounts(filteredInvoices);
  
    this.pieChartOptions = {
      series: Object.values(statusCounts),
      chart: {
        type: "pie",
        height: 350
      },
      labels: Object.keys(statusCounts),
      tooltip: {
        y: { formatter: (val) => `${val} invoices` }
      },
      legend: { position: 'bottom' }
    };
  }
  
  
  calculateStatusCounts(invoices: any[]): { [status: string]: number } {
    const statusCounts: { [status: string]: number } = {
      "Approved": 0,
      "Rejected": 0,
      "Pending": 0
    };
  
    invoices.forEach(invoice => {
      if (!invoice.header || !invoice.header.status) {
        console.warn("Skipping invoice due to missing status:", invoice);
        return;
      }
  
      const status = invoice.header.status.trim(); // Ensure no extra spaces
      console.log("Processing status:", status);
  
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status] += 1;
      } else {
        console.warn("Unexpected status found:", status);
      }
    });
  
    console.log("Final Status Counts:", statusCounts);
    return statusCounts;
  }
  
  
  
}