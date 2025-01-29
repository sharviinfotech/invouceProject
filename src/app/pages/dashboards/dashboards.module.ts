import { NgModule } from '@angular/core';
import { DashboardsRoutingModule } from './dashboards-routing.module';
import { BsDropdownConfig} from 'ngx-bootstrap/dropdown';
import { SampleComponentComponent } from './default/sample-component/sample-component.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { InvoiceLayoutComponent } from './invoice-layout/invoice-layout.component';
import { InvoiceReportsComponent } from './invoice-reports/invoice-reports.component';

@NgModule({
  declarations: [
    SampleComponentComponent,
    // InvoiceReportsComponent,
    // InvoiceComponent,
    // InvoiceLayoutComponent
  ],
  imports: [
    DashboardsRoutingModule,
  ],
  providers: [BsDropdownConfig],
})
export class DashboardsModule { }
