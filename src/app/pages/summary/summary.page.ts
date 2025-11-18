import { Component, inject } from '@angular/core'
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonDatetime,
} from '@ionic/angular/standalone'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { TransactionsService } from '../../services/transactions.service'
import { StorageService } from '../../services/storage.service'
 
import { IonFab, IonFabButton, IonIcon, IonChip } from '@ionic/angular/standalone'
import { Router } from '@angular/router'
import { NotificationService } from 'src/app/services/notification.service'
import { UtilsService } from 'src/app/services/utils.service'

@Component({
  selector: 'app-summary',
  templateUrl: 'summary.page.html',
  styleUrls: ['summary.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonDatetime,
    IonFab,
    IonFabButton,
    IonIcon,
    IonChip,
  ],
  
})
export class SummaryPage {
  year = new Date().getFullYear()
  month = new Date().getMonth()

  income = 0
  expense = 0
  balance = 0
  budgetCapital = 0
  budgetSaving = 0

  

  expenseByCategory: Record<string, number> = {}
  pieStyle = ''
  monthLabel = ''
  budgetLabel = ''
  monthTransactions: { type: string; category: string; note?: string; date: string; amount: number }[] = []
  recentSummaries: { year: number; month: number; label: string; income: number; expense: number; balance: number }[] = []

  private tx = inject(TransactionsService)
  private storageSvc = inject(StorageService)
  private router = inject(Router)
  public utilsSvc = inject(UtilsService)
  private notificationSvc = inject(NotificationService)

  ionViewWillEnter() {
    this.refresh()
  }

  async refresh() {
    const totals = await this.tx.getTotals(this.year, this.month)
    this.income = totals.income
    this.expense = totals.expense
    this.balance = 0

    const state = await this.storageSvc.getAppState()
    const b = state?.user?.budget
    console.log('b',b)
    if (b && b.year === this.year && b.month === this.month) {
      this.budgetLabel = b.name || 'Presupuesto activo'
      this.budgetCapital = Number(b.budget_goal || 0)
      this.budgetSaving = Number(b.saving || 0)
    } else {
      this.budgetLabel = 'Sin presupuesto activo'
      this.budgetCapital = 0
      this.budgetSaving = 0
    }

    this.balance = (this.budgetCapital + this.income) - this.expense

    this.expenseByCategory = await this.tx.getExpenseByCategory(this.year, this.month)
    this.pieStyle = this.buildConicGradient(this.expenseByCategory)
    const d = new Date(this.year, this.month, 1)
    this.monthLabel = d.toLocaleDateString('es', { month: 'long', year: 'numeric' })
    this.recentSummaries = await this.computeRecentSummaries(6)
    const list = await this.tx.getByMonth(this.year, this.month)
    this.monthTransactions = list.sort((a, b) => +new Date(b.date) - +new Date(a.date)).map((t) => ({
      type: t.type,
      category: t.category,
      note: t.note,
      date: t.date,
      amount: t.amount,
    }))
  }

  

  onMonthChange(ev: any) {
    const iso = ev?.detail?.value
    if (!iso) return
    const d = new Date(iso)
    this.year = d.getFullYear()
    this.month = d.getMonth()
    this.refresh()
    this.notificationSvc.showSuccess('Mes actualizado');
  }

  goToNewTransaction() {
    this.router.navigateByUrl('/tabs/transactions')
  }

  viewMonth(year: number, month: number) {
    this.year = year
    this.month = month
    this.refresh()
    this.notificationSvc.showInfo('Mostrando mes seleccionado');
  }

  

  private buildConicGradient(data: Record<string, number>): string {
    const entries = Object.entries(data)
    const total = entries.reduce((a, [, v]) => a + v, 0)
    if (total <= 0) return 'background: conic-gradient(#ccc 0deg 360deg)'
    const colors = [
      '#4e79a7',
      '#f28e2b',
      '#e15759',
      '#76b7b2',
      '#59a14f',
      '#edc949',
      '#af7aa1',
      '#ff9da7',
      '#9c755f',
      '#bab0ab',
    ]
    let start = 0
    const parts: string[] = []
    entries.forEach(([_, value], i) => {
      const deg = (value / total) * 360
      const end = start + deg
      const color = colors[i % colors.length]
      parts.push(`${color} ${start}deg ${end}deg`)
      start = end
    })
    return `background: conic-gradient(${parts.join(', ')})`
  }

  private async computeRecentSummaries(n: number) {
    const res: { year: number; month: number; label: string; income: number; expense: number; balance: number }[] = []
    let y = this.year
    let m = this.month
    for (let i = 0; i < n; i++) {
      const t = await this.tx.getTotals(y, m)
      const d = new Date(y, m, 1)
      res.push({
        year: y,
        month: m,
        label: d.toLocaleDateString('es', { month: 'long', year: 'numeric' }),
        income: t.income,
        expense: t.expense,
        balance: t.income - t.expense,
      })
      m -= 1
      if (m < 0) {
        m = 11
        y -= 1
      }
    }
    return res
  }
}
