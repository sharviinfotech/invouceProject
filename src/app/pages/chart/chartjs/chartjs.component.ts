import { Component } from "@angular/core";
import { ChartType } from "./chartjs.model";
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  DoughnutController,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  PolarAreaController,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
} from "chart.js";
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  PointElement,
  LineElement,
  BarController,
  DoughnutController,
  ArcElement,
  PolarAreaController,
  RadialLinearScale,
  PieController,
  RadarController
);

@Component({
  selector: "app-chartjs",
  templateUrl: "./chartjs.component.html",
  styleUrls: ["./chartjs.component.scss"],
})

/**
 * chartjs-chart component
 */
export class ChartjsComponent {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  public lineAreaChart: ChartType = {
    data: {
      labels: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
      ],
      datasets: [
        {
          label: "Sales Analytics",
          fill: true,
          tension: 0.5,
          backgroundColor: "rgba(85, 110, 230, 0.2)",
          borderColor: "#556ee6",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "#556ee6",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "#556ee6",
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: [65, 59, 80, 81, 56, 55, 40, 55, 30, 80],
        },
        {
          label: "Monthly Earnings",
          fill: true,
          tension: 0.5,
          backgroundColor: "rgba(235, 239, 242, 0.2)",
          borderColor: "#ebeff2",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "#ebeff2",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "#ebeff2",
          pointHoverBorderColor: "#eef0f2",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: [80, 23, 56, 65, 23, 35, 85, 25, 92, 36],
        },
      ],
    },
    options: {
      color: "#8791af",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: "rgba(166, 176, 207, 0.1)",
          },
        },
        y: {
          ticks: {
            //   max: 100,
            //   min: 20,
            stepSize: 10,
          },
          grid: {
            color: "rgba(166, 176, 207, 0.1)",
          },
        },
      },
    },
  };

  public barChart: ChartType = {
    data: {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
        {
          label: "Sales Analytics",
          backgroundColor: "rgba(52, 195, 143, 0.8)",
          borderColor: "rgba(52, 195, 143, 0.2)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(52, 195, 143, 0.9)",
          hoverBorderColor: "rgba(52, 195, 143, 0.9)",
          data: [65, 59, 81, 45, 56, 80, 50, 20],
          barThickness: 40,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: "rgba(166, 176, 207, 0.1)",
          },
        },

        y: {
          grid: {
            color: "rgba(166, 176, 207, 0.1)",
          },
        },
      },
    },
  };
  public pieChart: ChartType = {
    data: {
      labels: ["Desktops", "Tablets"],
      datasets: [
        {
          data: [300, 180],
          backgroundColor: ["#34c38f", "#ebeff2"],
          hoverBackgroundColor: ["#34c38f", "#ebeff2"],
          hoverBorderColor: "#fff",
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
    },
  };

  public donutChart: ChartType = {
    data: {
      labels: ["Desktops", "Tablets"],
      datasets: [
        {
          data: [300, 210],
          backgroundColor: ["#556ee6", "#ebeff2"],
          hoverBackgroundColor: ["#556ee6", "#ebeff2"],
          hoverBorderColor: "#fff",
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
    },
  };

  public radarChart: ChartType = {
    data: {
      labels: [
        "Eating",
        "Drinking",
        "Sleeping",
        "Designing",
        "Coding",
        "Cycling",
        "Running",
      ],
      datasets: [
        {
          label: "Desktops",
          backgroundColor: "rgba(52, 195, 143, 0.2)",
          borderColor: "#34c38f",
          pointBackgroundColor: "#34c38f",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#f46a6a",
          pointHoverBorderColor: "#34c38f",
          data: [65, 59, 90, 81, 56, 55, 40],
        },
        {
          label: "Tablets",
          backgroundColor: "rgba(85, 110, 230, 0.2)",
          borderColor: "#556ee6",
          pointBackgroundColor: "#556ee6",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#556ee6",
          data: [28, 48, 40, 19, 96, 27, 100],
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
    },
  };

  public polarChart: ChartType = {
    data: {
      labels: ["Series 1", "Series 2", "Series 3", "Series 4"],
      datasets: [
        {
          data: [11, 16, 7, 18],
          backgroundColor: ["#f46a6a", "#34c38f", "#f1b44c", "#556ee6"],
          label: "My dataset",
          hoverBorderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
    },
  };
}
