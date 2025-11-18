import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private storage = inject(Storage);

  // Guardar variable de entorno
  async setEnvironmentVariable(key: string, value: any): Promise<void> {
    await this.storage.set(key, value);
  }

  // Obtener variable de entorno
  async getEnvironmentVariable(key: string): Promise<any> {
    return await this.storage.get(key);
  }

  // Eliminar variable de entorno
  async removeEnvironmentVariable(key: string): Promise<void> {
    await this.storage.remove(key);
  }

  // Obtener todas las variables
  async getAllEnvironmentVariables(): Promise<{key: string, value: any}[]> {
    const keys = await this.storage.keys();
    const variables = [];

    for (const key of keys) {
      const value = await this.storage.get(key);
      variables.push({ key, value });
    }

    return variables;
  }

  // Método útil para obtener variables con valor por defecto
  async getVariable(key: string, defaultValue: any = null): Promise<any> {
    const value = await this.getEnvironmentVariable(key);
    return value !== null ? value : defaultValue;
  }
}
