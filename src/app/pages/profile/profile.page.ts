import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton,
  IonList, IonItem, IonLabel, IonIcon, IonText, IonButtons, ToastController, IonDatetimeButton, IonPopover, IonListHeader
} from '@ionic/angular/standalone';
import { ProfileService } from '../../services/profile.service';
import { ProfileModalComponent } from '../../modals/profile-modal/profile-modal.component';
import { ModalController } from '@ionic/angular';
import { personCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Budget } from '../../models/budget.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  standalone: true,
  imports: [IonListHeader, IonPopover, IonDatetimeButton, IonButtons, IonText,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    ReactiveFormsModule,
    CommonModule
  ],
  providers: [ModalController, ToastController]
})
export class ProfilePage implements OnInit {

  profileForm!: FormGroup;
  userName: string | null = null;
  budgets: Budget[] = [];
  editingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private modalController: ModalController,
    private toastCtrl: ToastController
  ) {
    addIcons({ personCircleOutline });
  }

  async ngOnInit() {
    this.profileForm = this.fb.group({
      nameBudget: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
    });
    const savedName = await this.profileService.getUserName();
    if (savedName) {
      this.profileForm.get('name')?.setValue(savedName);
      this.userName = savedName;
    }
  }

  // -------- Save --------
  async saveBudget() {
    if (this.profileForm.invalid) return;

    const raw = this.profileForm.value.amount.replace(/[^\d.-]/g, '');
    const numericAmount = parseFloat(raw);
    const formattedAmount = '$ ' + numericAmount.toLocaleString('es-CO');

    const newBudget: Budget = {
      name: this.profileForm.value.nameBudget,
      amount: numericAmount,
      formattedAmount: formattedAmount
    };

    await this.profileService.addBudget(newBudget);
    this.budgets.push(newBudget);

    this.profileForm.reset();

    const toast = await this.toastCtrl.create({
      message: 'Presupuesto guardado exitosamente!',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }


  // -------- Format --------
  formatCurrency(event: any) {
    let value = event.target.value.replace(/[^\d]/g, '');
    if (!value) {
      this.profileForm.get('amount')?.setValue('');
      return;
    }

    const formatted = '$ ' + Number(value).toLocaleString('es-CO');
    this.profileForm.get('amount')?.setValue(formatted);
  }

  // -------- Open modal --------
  async openProfileModal() {
    const modal = await this.modalController.create({
      component: ProfileModalComponent
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.profileForm.get('name')?.setValue(data);
      this.userName = data; // actualizar mensaje en la página
    }
  }

}
