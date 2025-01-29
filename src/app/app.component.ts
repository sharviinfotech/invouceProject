import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet,CommonModule, NgxSpinnerModule],
})
export class AppComponent implements OnInit {

  constructor(private spinner: NgxSpinnerService) {}

  ngOnInit() {
    // this.showSpinner();
  }

  // showSpinner() {
  //   this.spinner.show(); // Show spinner
  //   setTimeout(() => {
  //     this.spinner.hide(); // Hide after 3 seconds
  //   }, 3000);
  // }
}
