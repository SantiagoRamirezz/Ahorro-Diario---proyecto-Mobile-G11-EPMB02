import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: 'expense' | 'income';
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private storage = inject(Storage);
  private readonly STORAGE_KEY = 'transactions';

  constructor() {}

  // Agregar nueva transacción
  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<void> {
    const transactions = await this.getTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now() // ID único basado en timestamp
    };
    transactions.push(newTransaction);
    await this.storage.set(this.STORAGE_KEY, transactions);
  }

  // Obtener todas las transacciones
  async getTransactions(): Promise<Transaction[]> {
    return (await this.storage.get(this.STORAGE_KEY)) || [];
  }

  // Obtener gastos del mes actual
  async getCurrentMonthSpending(): Promise<number> {
    const transactions = await this.getTransactions();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyExpenses = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth &&
             transactionDate.getFullYear() === currentYear &&
             transaction.type === 'expense';
    });

    return monthlyExpenses.reduce((total, transaction) => total + transaction.amount, 0);
  }

  // Eliminar transacción
  async deleteTransaction(id: number): Promise<void> {
    const transactions = await this.getTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== id);
    await this.storage.set(this.STORAGE_KEY, filteredTransactions);
  }
}
