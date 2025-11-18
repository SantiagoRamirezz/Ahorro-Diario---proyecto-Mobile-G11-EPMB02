import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton,
  IonList, IonItem, IonLabel, IonIcon, IonText, IonButtons, ToastController, IonDatetimeButton, IonPopover, IonListHeader,
  IonChip
} from '@ionic/angular/standalone';
import { ProfileService } from '../../services/profile.service';
import { ProfileModalComponent } from '../../modals/profile-modal/profile-modal.component';
import { ModalController } from '@ionic/angular';
import { personCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Budget } from '../../models/budget.model';
import { StorageService } from '../../services/storage.service';
import { CommonModule } from '@angular/common';
import { UtilsService } from 'src/app/services/utils.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Router } from '@angular/router';

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
    IonChip,
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
  step = 1;
  wizardVisible = false;
  year = new Date().getFullYear();
  months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  monthIndex = new Date().getMonth();
  categoryModalOpen = false;
  selectedCategories = new Set<string>();
  suggestCategories = false;

  @ViewChild('budgetDesc') budgetDescInput?: IonInput;

  private fb = inject(FormBuilder)
  private profileService = inject(ProfileService)
  private modalController = inject(ModalController)
  private storageSvc = inject(StorageService)
  private utilsSvc = inject(UtilsService)
  private notificationSvc = inject(NotificationService)
  private router = inject(Router)

  async ngOnInit() {
    addIcons({ personCircleOutline })
    this.profileForm = this.fb.group({
      nameBudget: ['', Validators.required],
      income: ['', [Validators.required, Validators.min(1)]],
      saving: [''],
    });
    const state = await this.storageSvc.getAppState();
    console.log('name', state)
    const nameFromState = state?.user?.name ?? null;
    if (nameFromState) {
      this.userName = nameFromState;
    } else {
      const savedName = await this.profileService.getUserName();
      if (savedName) {
        this.userName = savedName;
        state.user = state.user || {};
        state.user.name = savedName;
        await this.storageSvc.setAppState(state);
      } else {
        this.userName = null;
      }
    }
  }

  // -------- Save --------
  async saveBudget() {
    if (this.profileForm.get('income')?.invalid) return;
    const incomeRaw = this.utilsSvc.parseMoneyInt(this.profileForm.value.income);
    const savingRaw = this.utilsSvc.parseMoneyInt(this.profileForm.value.saving);
    const incomeNum = parseFloat(incomeRaw.toString() || '0') || 0;
    const savingNum = Math.min(parseFloat(savingRaw.toString() || '0') || 0, incomeNum);
    const spendable = Math.max(incomeNum - savingNum, 0);
    const formattedAmount = '$ ' + spendable.toLocaleString('es-CO');
    const monthName = this.months[this.monthIndex];
    const desc = (this.profileForm.value.nameBudget || '').trim();
    const finalName = desc ? `${desc} (${monthName} ${this.year})` : `Presupuesto ${monthName} ${this.year}`;
    const newBudget: Budget = {
      name: finalName,
      amount: spendable,
      formattedAmount
    };
    await this.profileService.addBudget(newBudget);
    this.budgets.push(newBudget);
    const stateRaw = await this.storageSvc.getAppState();
    const state = stateRaw || {};
    state.user = state.user || {};
    state.user.name = this.userName ?? state.user.name ?? null;
    state.user.budget = {
      id: String(Date.now()),
      name: newBudget.name,
      salary: incomeNum,
      budget_goal: spendable,
      saving: savingNum,
      year: this.year,
      month: this.monthIndex,
      transactions: Array.isArray(state.user?.budget?.transactions) ? state.user.budget.transactions : []
    };
    await this.storageSvc.setAppState(state);

    this.profileForm.reset();
    this.step = 1;
    this.notificationSvc.showSuccess('Presupuesto guardado exitosamente!');
    this.router.navigateByUrl('/tabs/summary')
  }


  // -------- Format --------
  formatCurrencyIncome(event: any) {
    let value = (event.target.value || '').replace(/[^\d]/g, '');
    const formatted = value ? '$ ' + Number(value).toLocaleString('es-CO') : '';
    this.profileForm.get('income')?.setValue(formatted);
  }
  formatCurrencySaving(event: any) {
    let value = (event.target.value || '').replace(/[^\d]/g, '');
    const formatted = value ? '$ ' + Number(value).toLocaleString('es-CO') : '';
    this.profileForm.get('saving')?.setValue(formatted);
  }
  suggestedSaving() {
    const raw = (this.profileForm.value.income || '').replace(/[^\d.-]/g, '');
    const val = parseFloat(raw || '0') || 0;
    return Math.round(val * 0.1);
  }
  remainingAfterSaving() {
    const inc = this.utilsSvc.parseMoneyInt(this.profileForm.get('income')?.value);
    const sav = this.utilsSvc.parseMoneyInt(this.profileForm.get('saving')?.value);
    return Math.max(inc - sav, 0);
  }
  next() { this.step = Math.min(this.step + 1, 4) }
  back() {
    if (this.step === 1) {
      this.wizardVisible = false
      return
    }
    this.step = Math.max(this.step - 1, 1)
  }
  prevYear() { this.year--; }
  nextYear() { this.year++; }
  setMonth(i: number) {
    this.monthIndex = i;
    this.next();
    setTimeout(() => {
      try { this.budgetDescInput?.setFocus(); } catch {}
    }, 0);
  }

  startWizard() {
    this.wizardVisible = true
    this.step = 1
  }

  canContinue(): boolean {
    if (this.step === 1) return true
    if (this.step === 2) return !this.profileForm.get('income')?.invalid && !this.profileForm.get('nameBudget')?.invalid
    if (this.step === 3) return this.isSavingValid() && !this.profileForm.get('saving')?.invalid
    return false
  }

 isSavingValid(): boolean {
  const inc = this.utilsSvc.parseMoneyInt(this.profileForm.get('income')?.value);
  const sav = this.utilsSvc.parseMoneyInt(this.profileForm.get('saving')?.value);

  return sav <= inc;
}

  // -------- Open modal --------
  async openProfileModal() {
    const modal = await this.modalController.create({
      component: ProfileModalComponent
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.userName = data;
      await this.profileService.setUserName(data);
      const state = await this.storageSvc.getAppState();
      state.user = state.user || {};
      state.user.name = data;
      await this.storageSvc.setAppState(state);
    }
  }

  toggleCategory(value: string) {
    if (this.selectedCategories.has(value)) this.selectedCategories.delete(value)
    else this.selectedCategories.add(value)
  }
  openCategories() { this.categoryModalOpen = true }
  closeCategories() { this.categoryModalOpen = false }

}
