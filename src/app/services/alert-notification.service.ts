import { Injectable } from '@angular/core';

export interface AlertNotification {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: Date;
  leida: boolean;
  tipo: 'info' | 'advertencia' | 'exito' | 'error';
  modulo: string;
  datos?: any;
  icono?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertNotificationService {
  private readonly ALERTS_KEY = 'app_alert_notifications';
  private alertas: AlertNotification[] = [];

  constructor() {
    this.cargarAlertas();
  }

  private cargarAlertas() {
    const guardadas = localStorage.getItem(this.ALERTS_KEY);
    this.alertas = guardadas ? JSON.parse(guardadas) : [];
  }

  private guardarAlertas() {
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(this.alertas));
  }

  crearAlerta(
    titulo: string,
    mensaje: string,
    tipo: 'info' | 'advertencia' | 'exito' | 'error' = 'info',
    modulo: string = 'general',
    datos?: any
  ): AlertNotification {
    const nuevaAlerta: AlertNotification = {
      id: Date.now(),
      titulo,
      mensaje,
      fecha: new Date(),
      leida: false,
      tipo,
      modulo,
      datos,
      icono: this.getIconoTipo(tipo)
    };

    this.alertas.unshift(nuevaAlerta);

    if (this.alertas.length > 50) {
      this.alertas = this.alertas.slice(0, 50);
    }

    this.guardarAlertas();
    return nuevaAlerta;
  }

  private getIconoTipo(tipo: string): string {
    const iconos = {
      'info': 'information-circle-outline',
      'advertencia': 'warning-outline',
      'exito': 'checkmark-circle-outline',
      'error': 'close-circle-outline'
    };
    return iconos[tipo as keyof typeof iconos] || 'notifications-outline';
  }

  obtenerAlertas(): AlertNotification[] {
    this.cargarAlertas();
    return [...this.alertas].sort((a, b) =>
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }

  obtenerNoLeidas(): AlertNotification[] {
    return this.obtenerAlertas().filter(a => !a.leida);
  }

  marcarComoLeida(id: number): void {
    const alerta = this.alertas.find(a => a.id === id);
    if (alerta) {
      alerta.leida = true;
      this.guardarAlertas();
    }
  }

  marcarTodasComoLeidas(): void {
    this.alertas.forEach(a => a.leida = true);
    this.guardarAlertas();
  }

  eliminarAlerta(id: number): void {
    this.alertas = this.alertas.filter(a => a.id !== id);
    this.guardarAlertas();
  }

  eliminarTodas(): void {
    this.alertas = [];
    localStorage.removeItem(this.ALERTS_KEY);
  }

  contarNoLeidas(): number {
    return this.alertas.filter(a => !a.leida).length;
  }
}
