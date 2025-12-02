import { Injectable, inject } from '@angular/core'
import { Subject } from 'rxjs'
import type { Transaction } from '../models/transaction'
import { StorageService } from './storage.service'
import { AlertNotificationService } from './alert-notification.service'

const STORAGE_KEY = 'app_state'

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private storageSvc = inject(StorageService)
  private changes$ = new Subject<void>()
  private alertSvc = inject(AlertNotificationService)
  async getAll(): Promise<Transaction[]> {
    const state = await this.storageSvc.getAppState()
    const arr = state?.user?.budget?.transactions
    return Array.isArray(arr) ? (arr as Transaction[]) : []
  }

  async add(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    const item: Transaction = { ...tx, id: genId() }
    try {
      const state = await this.storageSvc.getAppState()
      state.user = state.user || {}
      state.user.budget = state.user.budget || {}
      const arr: Transaction[] = Array.isArray(state.user.budget.transactions)
        ? (state.user.budget.transactions as Transaction[])
        : []
      arr.push(item)
      state.user.budget.transactions = arr
      const d = new Date(item.date)
      const y = d.getFullYear()
      const m = d.getMonth()
      if (typeof state.user.budget.year === 'number' && typeof state.user.budget.month === 'number') {
        if (state.user.budget.year === y && state.user.budget.month === m) {
          const current = Number(state.user.budget.budget_goal || 0)
          state.user.budget.budget_goal = item.type === 'income' ? current + item.amount : current - item.amount
        }
      }
      await this.storageSvc.setAppState(state)
      const d2 = new Date(item.date)
      const y2 = d2.getFullYear()
      const m2 = d2.getMonth()
      const totals = await this.getTotals(y2, m2)
      const b = state.user?.budget
      const saving = Number(b?.saving || 0)
      const cap = Number(b?.budget_goal || 0)
      const balance = (cap + totals.income) - totals.expense
      if (typeof b?.year === 'number' && typeof b?.month === 'number' && b.year === y2 && b.month === m2) {
        if (balance < saving) {
          this.alertSvc.crearAlerta(
            'Meta de ahorro no cumplida',
            'Tu saldo disponible es inferior a la meta de ahorro planificada.',
            'advertencia',
            'transactions',
            { balance, saving }
          )
        }
      }
    } catch {}
    this.changes$.next()
    return item
  }

  async clear(): Promise<void> {
    const state = await this.storageSvc.getAppState()
    if (state?.user?.budget) {
      state.user.budget.transactions = []
      await this.storageSvc.setAppState(state)
    }
  }

  async getByMonth(year: number, month: number): Promise<Transaction[]> {
    const list = await this.getAll()
    return list.filter((t) => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
  }

  async getTotals(year: number, month: number): Promise<{ income: number; expense: number }> {
    const items = await this.getByMonth(year, month)
    let income = 0
    let expense = 0
    for (const t of items) {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    }
    return { income, expense }
  }

  async getExpenseByCategory(year: number, month: number): Promise<Record<string, number>> {
    const items = await this.getByMonth(year, month)
    const map: Record<string, number> = {}
    for (const t of items) {
      if (t.type !== 'expense') continue
      map[t.category] = (map[t.category] ?? 0) + t.amount
    }
    return map
  }

  getChanges() {
    return this.changes$.asObservable()
  }
}
