import { Component, OnInit, AfterViewInit } from '@angular/core';
// import { TOPBAR } from "../layouts.model";
import { EventService } from '../../core/services/event.service';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { RightsidebarComponent } from '../rightsidebar/rightsidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { HorizontaltopbarComponent } from '../horizontaltopbar/horizontaltopbar.component';

@Component({
  selector: 'app-horizontal',
  templateUrl: './horizontal.component.html',
  styleUrls: ['./horizontal.component.scss'],
  standalone:true,
  imports:[RouterOutlet,FooterComponent,RightsidebarComponent,TopbarComponent,HorizontaltopbarComponent]
})

/**
 * Horizontal-layout component
 */
export class HorizontalComponent implements OnInit, AfterViewInit {

  topbar: string;
  isCondensed: boolean;

  constructor(private eventService: EventService) { }

  ngOnInit() {

    // this.topbar = TOPBAR;

    this.eventService.subscribe('changeTopbar', (topbar) => {
      this.topbar = topbar;
      this.changeTopbar(this.topbar);
    });

    document.body.setAttribute('data-layout', 'horizontal');
    document.body.removeAttribute('data-sidebar');
    document.body.removeAttribute('data-layout-size');
    document.body.removeAttribute('data-keep-enlarged');
    document.body.removeAttribute('data-sidebar-small');

    this.changeTopbar(this.topbar);
  }

  ngAfterViewInit() {
  }

  /**
   * on settings button clicked from topbar
   */
  onSettingsButtonClicked() {
    document.body.classList.toggle('right-bar-enabled');
  }

  changeTopbar(topbar: string) {
    switch (topbar) {
      case "light":
        document.body.setAttribute("data-topbar", "light");
        break;
      case "dark":
        document.body.setAttribute("data-topbar", "dark");
        break;
      case "colored":
        document.body.setAttribute("data-topbar", "colored");
        break;
      default:
        document.body.setAttribute("data-topbar", "dark");
        break;
    }
  }

  /**
 * On mobile toggle button clicked
 */
  onToggleMobileMenu() {
    this.isCondensed = !this.isCondensed;
    document.body.classList.toggle('sidebar-enable');
    document.body.classList.toggle('vertical-collpsed');

    if (window.screen.width <= 768) {
      document.body.classList.remove('vertical-collpsed');
    }
  }

}
