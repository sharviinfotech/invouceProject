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
  yearFilteredInvoices: any[] = [];  
  filteredInvoiceList: any[] = [];    
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
    setTimeout(() => {
      this.spinner.show();
      this.service.getAllInvoice().subscribe(
        (res: any) => {
          this.spinner.hide();
          this.allInvoiceList = res.data;
          this.filteredInvoiceList = res.data;
          console.log("Fetched Invoice Data:", this.allInvoiceList);
          this.updateBarChart(this.allInvoiceList);
        },
        error => {
          this.spinner.hide();
          console.error("Error fetching invoices", error);
        }
      );
    }, 2000);
   
  }

  updateBarChart(data: any[]) {
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
      xaxis: { categories: years, title: { text: "Year" } },
      yaxis: { title: { text: "Invoice Count" } },
      legend: { position: 'bottom' }
    };    
  }

  filterByYear(selectedYear: string) {
    this.yearFilteredInvoices = this.allInvoiceList.filter(invoice => {
      if (!invoice.header?.ProformaInvoiceDate) return false;
      const [day, month, year] = invoice.header.ProformaInvoiceDate.split('-');
      return year === selectedYear;
    });

    this.filteredInvoiceList = [...this.yearFilteredInvoices]; // Reset to year filter
    this.updatePieChart();
  }

  updatePieChart() {
    const statusCounts: { [status: string]: number } = {};

    this.yearFilteredInvoices.forEach(invoice => {
      const status = invoice.status || "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log("Pie Chart Data:", statusCounts);

    this.pieChartOptions = {
      series: Object.values(statusCounts),
      chart: {
        type: "pie",
        height: 350,
        events: {
          dataPointSelection: (event, chartContext, config) => {
            const selectedStatus = Object.keys(statusCounts)[config.dataPointIndex];
            console.log("Selected Status:", selectedStatus);
            this.filterTableByStatus(selectedStatus);
          }
        }
      },
      // labels: Object.keys(statusCounts),
      labels: ['Approved','Rejected','Pending'],
      colors: ['#66ff66', '#ff6666', '#ffcc66'], 
      legend: { position: "bottom" },
      tooltip: { y: { formatter: (val) => `${val} invoices` } }
    };
  }

  filterTableByStatus(selectedStatus: string) {
    this.filteredInvoiceList = this.yearFilteredInvoices.filter(invoice => invoice.status === selectedStatus);
    console.log("Filtered Table Data by Status:", this.filteredInvoiceList);
  }

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
}