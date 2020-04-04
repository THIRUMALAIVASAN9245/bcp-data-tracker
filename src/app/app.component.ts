import { Component } from '@angular/core';
import { ToasterConfig } from 'angular2-toaster';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'bcp-data-track';

  public config: ToasterConfig =
    new ToasterConfig({
      showCloseButton: false,
      tapToDismiss: false,
      timeout: 2000
    });
}
