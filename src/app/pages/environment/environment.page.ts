import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonList,
  IonButtons,
  IonIcon,
  AlertController,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pencil, trash, close } from 'ionicons/icons';

import { EnvironmentService } from '../../services/environment.service';

@Component({
  selector: 'app-environment',
  templateUrl: './environment.page.html',
  styleUrls: ['./environment.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonList,
    IonButtons,
    IonIcon
  ]
})
export class EnvironmentPage implements OnInit {
  private environmentService = inject(EnvironmentService);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);

  variables: {key: string, value: any}[] = [];
  newKey = '';
  newValue = '';

  constructor() {
    addIcons({ pencil, trash, close });
  }

  async ngOnInit() {
    await this.loadVariables();
  }

  async loadVariables() {
    this.variables = await this.environmentService.getAllEnvironmentVariables();
  }

  async addVariable() {
    if (this.newKey && this.newValue) {
      await this.environmentService.setEnvironmentVariable(this.newKey, this.newValue);
      this.newKey = '';
      this.newValue = '';
      await this.loadVariables();
    }
  }

  async deleteVariable(key: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Estás seguro de eliminar la variable ${key}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.environmentService.removeEnvironmentVariable(key);
            await this.loadVariables();
          }
        }
      ]
    });

    await alert.present();
  }

  async editVariable(variable: {key: string, value: any}) {
    const alert = await this.alertController.create({
      header: 'Editar Variable',
      inputs: [
        {
          name: 'value',
          type: 'text',
          value: variable.value,
          placeholder: 'Valor'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.value) {
              await this.environmentService.setEnvironmentVariable(variable.key, data.value);
              await this.loadVariables();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
