// pages/summary/summary.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonProgressBar, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { warning } from 'ionicons/icons';

import { ProfileService } from '../../services/profile.service';
import { BudgetAlertService } from '../../services/budget-alert.service';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-summary',
  templateUrl: 'summary.page.html',
  styleUrls: ['summary.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonProgressBar, IonIcon,
    ExploreContainerComponent
  ],
})
export class SummaryPage implements OnInit {
  private profileService = inject(ProfileService);
  private budgetAlertService = inject(BudgetAlertService);

  monthlyBudget: number = 0;
  currentSpending: number = 800000; // Valor de ejemplo - $800,000
  percentage: number = 0;

  constructor() {
    addIcons({ warning });
  }

  async ngOnInit() {
    await this.loadBudgetData();
  }

  async loadBudgetData() {
    // Obtener presupuesto
    const budgets = await this.profileService.getBudgets();
    if (budgets.length > 0) {
      this.monthlyBudget = budgets[0].amount;

      // Calcular porcentaje
      this.percentage = this.monthlyBudget > 0 ? (this.currentSpending / this.monthlyBudget) * 100 : 0;

      // Verificar alerta
      await this.budgetAlertService.checkBudgetAlert(this.currentSpending, this.monthlyBudget);
    }
  }
}
