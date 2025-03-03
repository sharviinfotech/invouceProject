import { NgModule } from '@angular/core';
import { DashboardsRoutingModule } from './dashboards-routing.module';
import { BsDropdownConfig} from 'ngx-bootstrap/dropdown';
import { SampleComponentComponent } from './default/sample-component/sample-component.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { InvoiceLayoutComponent } from './invoice-layout/invoice-layout.component';
import { InvoiceReportsComponent } from './invoice-reports/invoice-reports.component';
import { InvoiceUserCreationComponent } from './invoice-user-creation/invoice-user-creation.component';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ReviewNotificationComponent } from './review-notification/review-notification.component';
// import { GlobalReviewEditComponent } from './global-review-edit/global-review-edit.component';

@NgModule({
  declarations: [
    SampleComponentComponent,
    // ReviewNotificationComponent,
    // GlobalReviewEditComponent,
    // InvoiceUserCreationComponent,
    // InvoiceReportsComponent,
    // InvoiceComponent,
    // InvoiceLayoutComponent
  ],
  imports: [
    DashboardsRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),  // Ensure it's in the imports array
    NgxSpinnerModule

  ],
  providers: [BsDropdownConfig],
})
export class DashboardsModule { }
