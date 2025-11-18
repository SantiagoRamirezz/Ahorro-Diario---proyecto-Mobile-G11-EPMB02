import { Injectable, inject } from '@angular/core'
import { ToastController } from '@ionic/angular'
import { UtilsService } from './utils.service'

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private _delay: number = 3000

  private toastCtrl = inject(ToastController)
  private utilsService = inject(UtilsService)

  /**
   * Muestra el toast con el mensaje de éxito enviado.
   * @param message
   * @param title
   */
  showSuccess(message: string, title?: string): void {
    this._showMessage('success', title ?? 'OK', message)
  }

  /**
   * Muestra el toast con el mensaje informativo enviado.
   * @param message
   * @param title
   */
  showInfo(message: string, title?: string): void {
    this._showMessage('info', title ?? 'Info', message)
  }

 

  /**
   * Muestra el toast con el mensaje de advertencia enviado.
   * @param message
   * @param title
   */
  showWarning(message: string, title?: string): void {
    this._showMessage('warn', title ?? 'Advertencia', message)
  }

  /**
   * Muestra el toast con el mensaje de error enviado.
   * @param message
   * @param title
   */
  showError(message: string, title?: string): void {
    this._showMessage('error', title ?? 'Error', message)
  }

  /**
   * Agregar un mensaje al servicio para que el toast lo muestre.
   * @param severity success | info | warn | error
   * @param title
   * @param message
   */
  private _showMessage(severity: string, title: string, message: string): void {
    const fullMessage = title ? `${title}: ${message}` : message
    const colorMap: Record<string, string> = {
      success: 'success',
      info: 'primary',
      warn: 'warning',
      error: 'danger',
    }
    const color = colorMap[severity] ?? 'primary'

    if ('10' == (window as any)['env']?.['codigoAplicacion']) {
      window.parent.postMessage({ type: 'toast', data: { severity: severity, summary: title, detail: message } }, '*')
    } else {
      this.toastCtrl
        .create({ message: fullMessage, duration: this._delay, position: 'bottom', color, cssClass: 'toast-salto-linea' })
        .then((t) => t.present())
    }
  }
}
