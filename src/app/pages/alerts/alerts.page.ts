import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBadge, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-alerts',
  templateUrl: 'alerts.page.html',
  styleUrls: ['alerts.page.scss'],
  imports: [IonIcon, IonButton, IonBadge, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})
export class AlertsPage {
  constructor() { }
}
