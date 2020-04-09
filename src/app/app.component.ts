import { Component } from '@angular/core';
import { ToasterConfig } from 'angular2-toaster';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'bcp-data-track';
  baseApplicationUrl = environment.apiBaseImageUrl;
  
  public config: ToasterConfig =
    new ToasterConfig({
      showCloseButton: false,
      tapToDismiss: false,
      timeout: 2000
    });
}
