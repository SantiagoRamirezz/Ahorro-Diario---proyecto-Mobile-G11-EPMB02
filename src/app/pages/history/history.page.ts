import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HistorialService, HistorialItem } from '../../services/historial.service';
import { TransactionsService } from '../../services/transactions.service';
import type { Transaction } from '../../models/transaction';
import { StorageService } from '../../services/storage.service';
import { addIcons } from 'ionicons';
import { airplaneOutline, fastFoodOutline, videocamOutline, shirtOutline, homeOutline, pricetagOutline, addCircleOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonBadge, IonIcon, IonButton, IonButtons, IonSegment,
  IonSegmentButton, IonInfiniteScroll, IonInfiniteScrollContent
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
    IonSegmentButton, IonInfiniteScroll, IonInfiniteScrollContent
  ]
})
export class HistoryPage implements OnInit {
  historial: HistorialItem[] = [];
  filtroModulo: string = 'todos';
  isLoading: boolean = true;
  allTransactions: Transaction[] = [];
  visibleCount: number = 10;
  private budgetMap: Record<string, any> = {};

  private historialService = inject(HistorialService);
  private txService = inject(TransactionsService);
  private storageSvc = inject(StorageService);
  private router = inject(Router);
  private changesSub?: Subscription;

  async ngOnInit() {
    addIcons({ airplaneOutline, fastFoodOutline, videocamOutline, shirtOutline, homeOutline, pricetagOutline, addCircleOutline });
    await this.cargarHistorial();
    this.changesSub = this.txService.getChanges().subscribe(async () => {
      if (this.filtroModulo === 'transactions') {
        await this.refreshTransactions();
      }
    });
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
      } else if (moduloStr === 'budgets') {
        this.historial = await this.historialService.obtenerHistorial();
      } else if (moduloStr === 'transactions') {
        await this.refreshTransactions();
        const state = await this.storageSvc.getAppState();
        this.budgetMap = state?.user?.budgetsByMonth || {};
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
    if (this.filtroModulo === 'budgets') {
      return this.historial.filter(item => item.tipo === 'presupuesto');
    }
    return this.historial.filter(item => item.modulo === this.filtroModulo);
  }

  onItemClick(item: HistorialItem) {
    if (item.tipo !== 'presupuesto') return;
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const nombreMes = (item.datos?.mes || '').toString();
    const idx = meses.indexOf(nombreMes);
    const year = Number(item.datos?.['año'] || item.datos?.anio || new Date(item.fecha).getFullYear());
    const month = idx >= 0 ? idx : new Date(item.fecha).getMonth();
    this.router.navigate(['/tabs/summary'], { queryParams: { year, month, from: 'history' } });
  }

  getVisibleTransactions(): Transaction[] {
    return this.allTransactions.slice(0, this.visibleCount);
  }

  loadMoreTransactions(ev: any) {
    const next = Math.min(this.visibleCount + 10, this.allTransactions.length);
    this.visibleCount = next;
    ev?.target?.complete?.();
  }

  private async refreshTransactions() {
    const items = await this.txService.getAll();
    this.allTransactions = items.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    this.visibleCount = Math.min(this.visibleCount, this.allTransactions.length) || 10;
  }

  getIconoCategoria(cat: string): string {
    const map: Record<string, string> = {
      'ingreso': 'add-circle-outline',
      'viajes': 'airplane-outline',
      'comida': 'fast-food-outline',
      'entretenimiento': 'videocam-outline',
      'moda': 'shirt-outline',
      'hogar': 'home-outline',
      'otros': 'pricetag-outline'
    };
    return map[cat] || 'pricetag-outline';
  }

  getCategoryDisplay(t: Transaction): string {
    return t.type === 'income' ? 'ingreso' : t.category;
  }

  getBudgetLabel(t: Transaction): string {
    const d = new Date(t.date);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${m}`;
    const bm = this.budgetMap[key];
    if (bm?.name) return bm.name;
    const label = new Date(y, m, 1).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
    return `Presupuesto ${label}`;
  }

  formatearFechaSoloDia(fecha: Date | string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
