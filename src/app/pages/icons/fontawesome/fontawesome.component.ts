import { Component, OnInit } from '@angular/core';

import { icons } from './data'
import { CommonModule } from '@angular/common';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';

@Component({
  selector: 'app-fontawesome',
  templateUrl: './fontawesome.component.html',
  styleUrls: ['./fontawesome.component.scss'],
  standalone:true,
  imports:[PagetitleComponent,CommonModule,]
})

/**
 * Font awesome component
 */
export class FontawesomeComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  icons: any;

  solid: string = "";
  regular: string = "";
  brand: string = "";

  constructor() { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Icons' }, { label: 'Font awesome', active: true }];
    setTimeout(() => {
      this.icons = icons;

      for (let entry of icons) {
        if (entry.attributes.membership.free.length) {
          for (let value of entry.attributes.membership.free) {
            switch (value) {
              case "brands":
                this.brand += '<div class="col-xl-3 col-lg-4 col-sm-6">\
                          <i class="fab fa-'+ entry.id + '"></i> fab fa-' + entry.id + '\
                      </div>';
                break;
              case 'solid':
                this.solid += '<div class="col-xl-3 col-lg-4 col-sm-6">\
                    <i class="fas fa-'+ entry.id + '"></i> fas fa-' + entry.id + '\
                </div>';
                break;
              default:
                this.regular += '<div class="col-xl-3 col-lg-4 col-sm-6">\
                          <i class="far fa-'+ entry.id + '"></i> far fa-' + entry.id + '\
                      </div>';
            }
          }
        }
      }

      document.getElementById("solid").innerHTML = this.solid;
      document.getElementById("brand").innerHTML = this.brand;
      document.getElementById("regular").innerHTML = this.regular;
    }, 0);
  }
}
