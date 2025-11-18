import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  

   validateRequiredField(value: any): boolean {
    // Verificar si el valor no es null ni undefined
    if (value !== null && value !== undefined) {
      // Verificar si el valor no es una cadena vacía (en caso de ser una cadena)
      if (typeof value === 'string' && value.trim() === '') {
        return false;
      }
      // Verificar si el valor no es un arreglo vacío (en caso de ser un arreglo)
      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
      return true;
    }
    return false;
  }


   validateNumericField(event: any) {
    const input = event.target;
    const regex = /[^0-9]/gi;
    input.value = input.value.replace(regex, '');
  }
  
  parseMoneyInt(value: any): number {
  if (value === null || value === undefined) return 0;
  const str = value.toString().replace(/[^\d]/g, '');
  if (!str) return 0;

  return parseInt(str, 10);
}


}
