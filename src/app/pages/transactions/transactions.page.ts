import { Component, inject } from '@angular/core'
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonList,
  IonDatetime,
  IonButtons,
  IonModal,
  IonDatetimeButton,
} from '@ionic/angular/standalone'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import { TransactionsService } from '../../services/transactions.service'
import type { TransactionType, Transaction } from '../../models/transaction'
import { CommonModule } from '@angular/common'
import { ToastController } from '@ionic/angular'
import { IonSegment, IonSegmentButton } from '@ionic/angular/standalone'
import { Router, ActivatedRoute } from '@angular/router'
import { NotificationService } from 'src/app/services/notification.service'
import { UtilsService } from 'src/app/services/utils.service'

@Component({
  selector: 'app-transactions',
  templateUrl: 'transactions.page.html',
  styleUrls: ['transactions.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonList,
    IonDatetime,
    IonButtons,
    IonModal,
    IonSegment,
    IonSegmentButton,
    IonDatetimeButton,
  ],
})
export class TransactionsPage {
  private fb = inject(FormBuilder)
  private tx = inject(TransactionsService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private notificationSvc = inject(NotificationService)
  private utilsSvc = inject(UtilsService)

  form = this.fb.group({
    type: ['expense' as TransactionType, Validators.required],
    amount: ['', [Validators.required]],
    category: ['otros', Validators.required],
    date: [new Date().toISOString(), Validators.required],
    note: [''],
  })

  categories: { value: string; label: string; icon: string; description?: string }[] = [
    { value: 'viajes', label: 'Viajes', icon: 'flight' },
    { value: 'comida', label: 'Comida', icon: 'restaurant' },
    { value: 'entretenimiento', label: 'Entretenimiento', icon: 'theaters' },
    { value: 'moda', label: 'Moda', icon: 'checkroom' },
    { value: 'hogar', label: 'Hogar', icon: 'home' },
    { value: 'otros', label: 'Otros', icon: 'category' },
  ]

  list: Transaction[] = []



  ionViewWillEnter() {
    const qp = this.route.snapshot.queryParamMap
    const y = qp.get('year')
    const m = qp.get('month')
    if (y && m) {
      this.viewYear = Number(y)
      this.viewMonth = Number(m)
    } else {
      const now = new Date()
      this.viewYear = now.getFullYear()
      this.viewMonth = now.getMonth()
    }
    this.load()
  }

  async load() {
    const items = await this.tx.getAll()
    this.list = items.sort((a, b) => +new Date(b.date) - +new Date(a.date))
  }

  async submit() {
    if (this.form.invalid) return
    if (this.isPastBudget()) {
      this.notificationSvc.showError('No puedes registrar en presupuestos anteriores')
      return
    }
    const value = this.form.value
    const d = new Date(value.date!)
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const dateStr = dateOnly.toISOString().split('T')[0]
    const amountNum = this.utilsSvc.parseMoneyInt(value.amount)
    if (amountNum <= 0) return
    const item = await this.tx.add({
      type: value.type!,
      amount: amountNum,
      category: value.type === 'expense' ? value.category! : 'otros',
      date: dateStr,
      note: value.note ?? '',
    })
    await this.load()
    this.form.patchValue({ amount: '', note: '' })
    this.notificationSvc.showSuccess('Transacción guardada');
    this.router.navigateByUrl('/tabs/summary')
  }

  cancel() {
    this.form.reset({ type: 'expense', amount: '', category: 'otros', date: new Date().toISOString(), note: '' });
    this.router.navigateByUrl('/tabs/summary')
  }

  onTypeSegmentChange(ev: any) {
    const v = ev?.detail?.value as TransactionType
    this.form.get('type')?.setValue(v)
  }

  selectCategory(value: string) {
    this.form.get('category')?.setValue(value)
    this.categoryOpen = false
  }

  categoryOpen = false
  openCategoryModal() { this.categoryOpen = true }
  getCategoryLabel(v: string | null | undefined) {
    const f = this.categories.find((c) => c.value === v)
    return f?.label ?? v ?? ''
  }

  getCategoryIcon(v: string | null | undefined) {
    const f = this.categories.find((c) => c.value === v)
    return f?.icon ?? 'category'
  }


  setOpen(isOpen: boolean) {
    this.categoryOpen = isOpen;
  }

  formatAmount(event: any) {
    let value = (event.target.value || '').replace(/[^\d]/g, '')
    const formatted = value ? '$ ' + Number(value).toLocaleString('es-CO') : ''
    this.form.get('amount')?.setValue(formatted)
  }

  private viewYear: number = new Date().getFullYear()
  private viewMonth: number = new Date().getMonth()
  private isPastBudget(): boolean {
    const now = new Date()
    const selected = new Date(this.viewYear, this.viewMonth, 1)
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return selected < currentMonth
  }
}
