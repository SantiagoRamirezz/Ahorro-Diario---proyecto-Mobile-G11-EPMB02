import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton,
  IonList, IonItem, IonLabel, IonIcon, IonButtons, ToastController, IonListHeader,
  IonChip, IonNote
} from '@ionic/angular/standalone';
import { ProfileService } from '../../services/profile.service';
import { ProfileModalComponent } from '../../modals/profile-modal/profile-modal.component';
import { ModalController } from '@ionic/angular/standalone';
import { personCircleOutline, settingsOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Budget } from '../../models/budget.model';
import { StorageService } from '../../services/storage.service';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  standalone: true,
  imports: [IonNote,
    IonListHeader,
    IonButtons,
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
    IonChip,
    ReactiveFormsModule,
    CommonModule
  ],
  providers: [ModalController, ToastController]
})
export class ProfilePage implements OnInit {

  profileForm!: FormGroup;
  budgetValue: number = 0;
  userName: string | null = null;
  budgets: Budget[] = [];
  version: string = environment.version;
  today: string = new Date().toLocaleDateString('es-CO');


  private profileService = inject(ProfileService)
  private modalController = inject(ModalController)
  private storageSvc = inject(StorageService)


  async ngOnInit() {
    addIcons({ personCircleOutline, settingsOutline });

    const state = await this.storageSvc.getAppState();

    this.userName = state?.user?.name || null;

    // Traer presupuesto creado
    const budgetGoal = state?.user?.budget?.budget_goal || 0;
    this.budgetValue = budgetGoal;

    // Asegura que el estado tenga name sincronizado
    if (this.userName) {
      state.user = state.user || {};
      state.user.name = this.userName;
      await this.storageSvc.setAppState(state);
    }
  }



  // -------- Open profile modal --------
  async openProfileModal() {
    const modal = await this.modalController.create({
      component: ProfileModalComponent
    });

    await modal.present();

    const { data: updatedName } = await modal.onWillDismiss();
    if (updatedName) {
      this.userName = updatedName;

      // 1. Guardar en ProfileService
      await this.profileService.setUserName(updatedName);

      // 2. Guardar también en AppState
      const state = await this.storageSvc.getAppState();
      state.user = state.user || {};
      state.user.name = updatedName;
      await this.storageSvc.setAppState(state);
    }
  }

  async ionViewWillEnter() {
    const state = await this.storageSvc.getAppState();
    const storedName = state?.user?.name ?? await this.profileService.getUserName();

    this.userName = storedName || null;
    this.budgetValue = state?.user?.budget?.budget_goal || 0;
  }

}
