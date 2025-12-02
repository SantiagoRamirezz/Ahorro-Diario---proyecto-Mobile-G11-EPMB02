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
 
import { IonFab, IonFabButton, IonIcon, IonChip, IonButton } from '@ionic/angular/standalone'
import { Router, ActivatedRoute } from '@angular/router'
import { NotificationService } from 'src/app/services/notification.service'
import { UtilsService } from 'src/app/services/utils.service'
import { HistorialService, HistorialItem } from 'src/app/services/historial.service'

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
    IonButton,
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
  private route = inject(ActivatedRoute)
  public utilsSvc = inject(UtilsService)
  private notificationSvc = inject(NotificationService)
  private historialSvc = inject(HistorialService)

  fromHistory = false

  ionViewWillEnter() {
    const qp = this.route.snapshot.queryParamMap
    const y = qp.get('year')
    const m = qp.get('month')
    const f = qp.get('from')
    if (y && m) {
      this.year = Number(y)
      this.month = Number(m)
    }
    this.fromHistory = f === 'history'
    this.refresh()
  }

  async refresh() {
    const totals = await this.tx.getTotals(this.year, this.month)
    this.income = totals.income
    this.expense = totals.expense
    this.balance = 0

    const state = await this.storageSvc.getAppState()
    const key = `${this.year}-${this.month}`
    const map = state?.user?.budgetsByMonth || {}
    const bm = map[key]
    if (bm) {
      this.budgetLabel = bm.name || 'Presupuesto activo'
      this.budgetCapital = Number(bm.budget_goal || 0)
      this.budgetSaving = Number(bm.saving || 0)
    } else {
      const b = state?.user?.budget
      if (b && b.year === this.year && b.month === this.month) {
        this.budgetLabel = b.name || 'Presupuesto activo'
        this.budgetCapital = Number(b.budget_goal || 0)
        this.budgetSaving = Number(b.saving || 0)
      } else {
        const ok = await this.tryHistoryFallback(this.year, this.month)
        if (!ok) {
          this.budgetLabel = 'Sin presupuesto activo'
          this.budgetCapital = 0
          this.budgetSaving = 0
        }
      }
    }

    this.balance = (this.budgetCapital + this.income) - this.expense
    if (this.balance < this.budgetSaving && this.budgetSaving > 0) {
      this.notificationSvc.showWarning('La meta de ahorro no se cumplió')
    }

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
    const now = new Date()
    const selected = new Date(this.year, this.month, 1)
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    if (selected < currentMonth) {
      this.notificationSvc.showError('No puedes registrar en presupuestos anteriores')
      return
    }
    this.router.navigate(['/tabs/transactions'], { queryParams: { year: this.year, month: this.month } })
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

  private async tryHistoryFallback(year: number, month: number): Promise<boolean> {
    const list = await this.historialSvc.obtenerHistorial()
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    const match = list.find((i) => {
      if (i.tipo !== 'presupuesto') return false
      const y = Number((i.datos?.['año'] ?? i.datos?.anio) || new Date(i.fecha).getFullYear())
      const nombreMes = (i.datos?.mes || '').toString()
      const idx = meses.indexOf(nombreMes)
      const m = idx >= 0 ? idx : new Date(i.fecha).getMonth()
      return y === year && m === month
    })
    if (!match) return false
    this.budgetLabel = match.datos?.nombre || 'Presupuesto activo'
    this.budgetCapital = Number(match.datos?.presupuesto || 0)
    this.budgetSaving = Number(match.datos?.ahorro || 0)
    return true
  }

  async goToLatestBudget() {
    const latest = await this.getLatestBudgetYM()
    if (!latest) return
    this.fromHistory = false
    this.viewMonth(latest.year, latest.month)
    this.notificationSvc.showInfo('Volviendo al presupuesto más reciente')
  }

  private async getLatestBudgetYM(): Promise<{ year: number; month: number } | null> {
    const list = await this.historialSvc.obtenerHistorial()
    const budgets = list.filter((i: HistorialItem) => i.tipo === 'presupuesto')
    if (!budgets.length) return null
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    let best: { year: number; month: number } | null = null
    for (const b of budgets) {
      const y = Number((b.datos?.['año'] ?? b.datos?.anio) || new Date(b.fecha).getFullYear())
      const idx = meses.indexOf((b.datos?.mes || '').toString())
      const m = idx >= 0 ? idx : new Date(b.fecha).getMonth()
      if (!best) best = { year: y, month: m }
      else {
        const cur = new Date(best.year, best.month, 1)
        const cand = new Date(y, m, 1)
        if (cand > cur) best = { year: y, month: m }
      }
    }
    return best
  }
}
