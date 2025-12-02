import { Injectable, inject } from '@angular/core';
import { HistorialService, HistorialItem } from './historial.service';

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: Date;
  leida: boolean;
  tipo: 'info' | 'advertencia' | 'exito' | 'error';
  modulo: string;
  datos?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationAlertService {
  private readonly NOTIFICACIONES_KEY = 'app_notificaciones';
  private notificaciones: Notificacion[] = [];

  private historialService = inject(HistorialService);

  constructor() {
    this.cargarNotificaciones();
  }

  private cargarNotificaciones() {
    const guardadas = localStorage.getItem(this.NOTIFICACIONES_KEY);
    this.notificaciones = guardadas ? JSON.parse(guardadas) : [];
  }

  private guardarNotificaciones() {
    localStorage.setItem(this.NOTIFICACIONES_KEY, JSON.stringify(this.notificaciones));
  }

  // Crear notificación desde historial
  crearDesdeHistorial(historialItem: HistorialItem): Notificacion {
    const notificacion: Notificacion = {
      id: Date.now(),
      titulo: this.generarTitulo(historialItem),
      mensaje: this.generarMensaje(historialItem),
      fecha: new Date(historialItem.fecha),
      leida: false,
      tipo: this.determinarTipo(historialItem),
      modulo: historialItem.modulo,
      datos: historialItem.datos
    };
    return notificacion;
  }

  private generarTitulo(item: HistorialItem): string {
    const titulos: { [key: string]: string } = {
      'transaccion': item.accion,
      'presupuesto': 'Presupuesto Actualizado',
      'configuracion': 'Configuración Cambiada',
      'general': 'Nueva Actividad'
    };
    return titulos[item.tipo] || item.accion;
  }

  private generarMensaje(item: HistorialItem): string {
    if (item.tipo === 'transaccion' && item.datos) {
      const tipo = item.datos.tipo === 'expense' ? 'Gasto' : 'Ingreso';
      return `${tipo} de $${item.datos.monto?.toLocaleString('es-CO') || 0} en ${item.datos.categoria || 'varios'}`;
    }

    if (item.tipo === 'presupuesto' && item.datos) {
      return `Presupuesto ${item.datos.nombre}: $${item.datos.presupuesto?.toLocaleString('es-CO') || 0}`;
    }

    return item.accion;
  }

  private determinarTipo(item: HistorialItem): 'info' | 'advertencia' | 'exito' | 'error' {
    if (item.tipo === 'transaccion' && item.datos?.tipo === 'expense') {
      return 'advertencia';
    }
    if (item.tipo === 'presupuesto') {
      return 'exito';
    }
    return 'info';
  }

  // Obtener todas las notificaciones
  obtenerNotificaciones(): Notificacion[] {
    this.cargarNotificaciones();
    return [...this.notificaciones].sort((a, b) =>
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }

  // Obtener notificaciones no leídas
  obtenerNoLeidas(): Notificacion[] {
    return this.obtenerNotificaciones().filter(n => !n.leida);
  }

  // Marcar como leída
  marcarComoLeida(id: number): void {
    const notificacion = this.notificaciones.find(n => n.id === id);
    if (notificacion) {
      notificacion.leida = true;
      this.guardarNotificaciones();
    }
  }

  // Marcar todas como leídas
  marcarTodasComoLeidas(): void {
    this.notificaciones.forEach(n => n.leida = true);
    this.guardarNotificaciones();
  }

  // Eliminar notificación
  eliminarNotificacion(id: number): void {
    this.notificaciones = this.notificaciones.filter(n => n.id !== id);
    this.guardarNotificaciones();
  }

  // Eliminar todas
  eliminarTodas(): void {
    this.notificaciones = [];
    localStorage.removeItem(this.NOTIFICACIONES_KEY);
  }

  // Sincronizar con historial
  async sincronizarConHistorial(): Promise<void> {
    const historial = await this.historialService.obtenerHistorial();
    const ultimos7Dias = new Date();
    ultimos7Dias.setDate(ultimos7Dias.getDate() - 7);

    const historialReciente = historial.filter(item =>
      new Date(item.fecha) > ultimos7Dias
    );

    // Crear notificaciones para historial reciente que no existan
    historialReciente.forEach(item => {
      const existe = this.notificaciones.some(n =>
        n.fecha.getTime() === new Date(item.fecha).getTime() &&
        n.titulo === this.generarTitulo(item)
      );

      if (!existe) {
        const notificacion = this.crearDesdeHistorial(item);
        this.notificaciones.push(notificacion);
      }
    });

    this.guardarNotificaciones();
  }
}
