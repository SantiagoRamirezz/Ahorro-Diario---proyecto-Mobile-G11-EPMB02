// services/budget-alert.service.ts
import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class BudgetAlertService {
  private toastCtrl = inject(ToastController);

  // Verificar alerta basada en gasto actual y presupuesto
  async checkBudgetAlert(currentSpending: number, monthlyBudget: number): Promise<void> {
    if (!monthlyBudget || monthlyBudget <= 0) return;

    const percentage = (currentSpending / monthlyBudget) * 100;

    if (percentage >= 80 && percentage < 100) {
      await this.showAlert(currentSpending, monthlyBudget, percentage);
    }
  }

  private async showAlert(currentSpending: number, monthlyBudget: number, percentage: number): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: `⚠️ Alerta: Has gastado el ${percentage.toFixed(1)}% de tu presupuesto ($${currentSpending.toLocaleString('es-CO')} de $${monthlyBudget.toLocaleString('es-CO')})`,
      duration: 5000,
      position: 'top',
      color: 'warning',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
