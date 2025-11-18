import { Injectable, inject } from '@angular/core'
import { TransactionsService } from './transactions.service'

const BUDGET_KEY_PREFIX = 'budget:'

function keyFor(year: number, month: number): string {
  return `${BUDGET_KEY_PREFIX}${year}-${String(month + 1).padStart(2, '0')}`
}

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private tx = inject(TransactionsService)

  getBudget(year: number, month: number): number {
    const key = keyFor(year, month)
    const raw = localStorage.getItem(key)
    return raw ? Number(raw) : 0
  }

  setBudget(year: number, month: number, amount: number): void {
    const key = keyFor(year, month)
    localStorage.setItem(key, String(amount))
  }

  getProgress(year: number, month: number): { spent: number; budget: number; ratio: number } {
    const { expense: spent } = this.tx.getTotals(year, month)
    const budget = this.getBudget(year, month)
    const ratio = budget > 0 ? Math.min(spent / budget, 1) : 0
    return { spent, budget, ratio }
  }
}

