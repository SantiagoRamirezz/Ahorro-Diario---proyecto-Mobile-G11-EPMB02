import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertNotificationService, AlertNotification } from '../../services/alert-notification.service';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonIcon, IonChip,
  IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { informationCircleOutline, warningOutline, checkmarkCircleOutline, closeCircleOutline, cashOutline, personOutline, statsChartOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-alerts',
  templateUrl: 'alerts.page.html',
  styleUrls: ['alerts.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonIcon, IonChip,
    IonNote
  ]
})
export class AlertsPage {
  alertas: AlertNotification[] = [];

  private alertNotificationService = inject(AlertNotificationService);

  ionViewWillEnter() {
    addIcons({ informationCircleOutline, warningOutline, checkmarkCircleOutline, closeCircleOutline, cashOutline, personOutline, statsChartOutline, timeOutline });
    this.cargarAlertas();
  }

  cargarAlertas() {
    this.alertas = this.alertNotificationService.obtenerAlertas();
  }

  formatearFecha(fecha: Date): string {
    const date = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - date.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 60) {
      return `Hace ${minutos} min${minutos !== 1 ? 's' : ''}`;
    } else if (horas < 24) {
      return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
    } else if (dias < 7) {
      return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short'
      });
    }
  }

  getIcono(alerta: AlertNotification): string {
    const byModule: Record<string, string> = {
      'home': 'person-outline',
      'transactions': 'cash-outline',
      'summary': 'stats-chart-outline',
      'history': 'time-outline'
    };
    if (alerta.modulo && byModule[alerta.modulo]) return byModule[alerta.modulo];
    return alerta.icono || this.getIconoTipo(alerta.tipo);
  }

  getIconoTipo(tipo: string): string {
    const iconos = {
      'info': 'information-circle-outline',
      'advertencia': 'warning-outline',
      'exito': 'checkmark-circle-outline',
      'error': 'close-circle-outline'
    };
    return iconos[tipo as keyof typeof iconos] || 'notifications-outline';
  }

  getColorTipo(tipo: string): string {
    const colores = {
      'info': 'primary',
      'advertencia': 'warning',
      'exito': 'success',
      'error': 'danger'
    };
    return colores[tipo as keyof typeof colores] || 'medium';
  }
}
