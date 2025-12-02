import { Component, OnInit } from '@angular/core';
import { HistorialService, HistorialItem } from '../../services/historial.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonBadge, IonIcon, IonButton, IonButtons, IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
  styleUrls: ['history.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
    IonLabel, IonBadge, IonIcon, IonButton, IonButtons, IonSegment,
    IonSegmentButton
  ]
})
export class HistoryPage implements OnInit {
  historial: HistorialItem[] = [];
  filtroModulo: string = 'todos';
  isLoading: boolean = true;

  constructor(private historialService: HistorialService) {}

  async ngOnInit() {
    await this.cargarHistorial();
  }

  async ionViewWillEnter() {
    await this.cargarHistorial();
  }

  async cargarHistorial() {
    this.isLoading = true;
    try {
      this.historial = await this.historialService.obtenerHistorial();
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async filtrarPorModulo(modulo: any) {
    // Asegurarse de que sea string
    const moduloStr = (modulo?.toString() || 'todos') as string;

    this.filtroModulo = moduloStr;
    this.isLoading = true;

    try {
      if (moduloStr === 'todos') {
        this.historial = await this.historialService.obtenerHistorial();
      } else {
        this.historial = await this.historialService.obtenerHistorialPorModulo(moduloStr);
      }
    } catch (error) {
      console.error('Error filtrando historial:', error);
    } finally {
      this.isLoading = false;
    }
  }

  formatearFecha(fecha: Date | string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getIconoModulo(modulo: string): string {
    const iconos: {[key: string]: string} = {
      'home': 'home-outline',
      'transactions': 'cash-outline',
      'profile': 'person-outline',
      'alerts': 'notifications-outline',
      'summary': 'pie-chart-outline'
    };
    return iconos[modulo] || 'help-outline';
  }

  getColorTipo(tipo: string): string {
    const colores: {[key: string]: string} = {
      'transaccion': 'success',
      'presupuesto': 'warning',
      'configuracion': 'primary',
      'general': 'medium'
    };
    return colores[tipo] || 'medium';
  }

  async limpiarHistorial() {
    await this.historialService.limpiarHistorial();
    await this.cargarHistorial();
  }

  getHistorialFiltrado(): HistorialItem[] {
    if (this.filtroModulo === 'todos') {
      return this.historial;
    }
    return this.historial.filter(item => item.modulo === this.filtroModulo);
  }
}
