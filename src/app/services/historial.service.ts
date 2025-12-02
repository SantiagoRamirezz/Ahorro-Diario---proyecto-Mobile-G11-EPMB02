import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface HistorialItem {
  id: number;
  accion: string;
  fecha: Date;
  datos?: any;
  modulo: string; // 'home', 'transactions', etc.
  tipo: string; // 'transaccion', 'presupuesto', 'configuracion'
}

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private readonly HISTORIAL_KEY = 'app_historial';
  private historial: HistorialItem[] = [];

  constructor(private storageService: StorageService) {
    this.cargarHistorial();
  }

  async cargarHistorial() {
    this.historial = (await this.storageService.get(this.HISTORIAL_KEY)) || [];
  }

  async agregarEntrada(accion: string, datos?: any, modulo: string = 'home', tipo: string = 'general') {
    const nuevaEntrada: HistorialItem = {
      id: Date.now(),
      accion,
      fecha: new Date(),
      datos,
      modulo,
      tipo
    };

    this.historial.unshift(nuevaEntrada);
    // Mantener solo los últimos 100 registros
    if (this.historial.length > 100) {
      this.historial = this.historial.slice(0, 100);
    }

    await this.storageService.set(this.HISTORIAL_KEY, this.historial);
  }

  async obtenerHistorial(): Promise<HistorialItem[]> {
    await this.cargarHistorial();
    return this.historial;
  }

  async obtenerHistorialPorModulo(modulo: string): Promise<HistorialItem[]> {
    await this.cargarHistorial();
    return this.historial.filter(item => item.modulo === modulo);
  }

  async limpiarHistorial() {
    this.historial = [];
    await this.storageService.remove(this.HISTORIAL_KEY);
  }
}
