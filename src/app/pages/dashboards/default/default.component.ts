import { Component, OnInit,AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule,ChartComponent } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
  ApexGrid,
  ApexPlotOptions,
  ApexLegend,
  ApexFill,
  ApexTooltip,
  ApexResponsive
} from "ng-apexcharts";
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ... (Other imports and interfaces remain the same)

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  grid: ApexGrid;
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
  fill: ApexFill;
  tooltip: ApexTooltip;
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
export class DefaultComponent implements OnInit, AfterViewInit {  // ... (other properties)
  showSubBarChart: boolean = false; // Initially hidden
  subbarChartOptions: any = {}; // Ensure this exists
  
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  emailSentBarChart: Partial<ChartOptions> = {};
  allInvoiceList: any[];
  bsConfig: { dateInputFormat: string; containerClass: string; };

  constructor(
    private service: GeneralserviceService,
    private spinner: NgxSpinnerService,
  ) {
    this.bsConfig = {
      dateInputFormat: 'YYYY-MM-DD',
      containerClass: 'theme-blue',
    };
  }
  ngAfterViewInit() { // Use ngAfterViewInit
    if (this.allInvoiceList && this.allInvoiceList.length > 0 && this.chartContainer) { // Check if data and container are available
      this.updateBarChart(this.allInvoiceList);
    }
  }

  ngOnInit(): void {
    this.getAllInvoice();
  }

  getAllInvoice() {
    this.spinner.show();
    this.service.getAllInvoice().subscribe(
      (res: any) => {
        this.spinner.hide();
        this.allInvoiceList = res.invoices;
        if (this.chartContainer) {  // Check if chartContainer is defined
          this.updateBarChart(this.allInvoiceList);
        }
      },
      (error) => {
        this.spinner.hide();
        console.error("Error fetching invoices:", error);
      }
    );
  }


  updateBarChart(invoices: any[]) {
    const yearlyStatusCounts = this.calculateYearlyStatusCounts(invoices);
    const years = Object.keys(yearlyStatusCounts);
    const seriesData = [];

    // Prepare series data for each status
    const allStatuses = new Set<string>(); // Use a Set to store unique statuses
    for (const year in yearlyStatusCounts) {
      for (const status in yearlyStatusCounts[year]) {
        allStatuses.add(status);
      }
    }
    const statusesArray = Array.from(allStatuses); // Convert Set to Array

    for (const status of statusesArray) {
      const dataPoints = years.map(year => yearlyStatusCounts[year][status] || 0); // Handle missing years/statuses
      seriesData.push({ name: status, data: dataPoints });
    }


    this.emailSentBarChart = {
      series: seriesData,
      chart: {
        type: "bar",
        height: 350,
        stacked: true, // Stacked bar chart
        toolbar: {
          show: true
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 10,
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: years, // Years as categories
        title: {
          text: "Year"
        }
      },
      yaxis: {
        title: {
          text: "Count"
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " invoices";
          }
        }
      },
      // Assign colors dynamically based on the number of statuses
      colors: this.generateColors(statusesArray.length),
      legend: {
        position: 'bottom'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            height: 300
          },
          legend: {
            position: "bottom"
          }
        }
      }]
    };
  }


  calculateYearlyStatusCounts(invoices: any[]): { [year: string]: { [status: string]: number } } {
    const yearlyStatusCounts: { [year: string]: { [status: string]: number } } = {};

    invoices.forEach(invoice => {
      const date = new Date(invoice.header.ProformaInvoiceDate); // Assuming date format is YYYY-MM-DD
      const year = date.getFullYear().toString();
      const status = invoice.header.status;

      if (!yearlyStatusCounts[year]) {
        yearlyStatusCounts[year] = {};
      }
      yearlyStatusCounts[year][status] = (yearlyStatusCounts[year][status] || 0) + 1;
    });

    return yearlyStatusCounts;
  }

  generateColors(numColors: number): string[] {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      // Simple color generation (you can improve this for better variety)
      colors.push(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
    }
    return colors;
  }



  // ... (rest of your component code)
}