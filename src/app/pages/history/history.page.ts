import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBadge, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
  styleUrls: ['history.page.scss'],
  imports: [IonIcon, IonButton, IonBadge, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})
export class HistoryPage {
  constructor() { }
}
