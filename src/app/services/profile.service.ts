import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Budget } from '../models/budget.model';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    private _storage: Storage | null = null;
    private budgets: Budget[] = [];

    private storage = inject(Storage);

    constructor() {
        this.init();
    }

    private async init() {
        this._storage = await this.storage.create();
    }

    // -----------------------
    // USER NAME
    // -----------------------
    async setUserName(name: string) {
        await this._storage?.set('user_name', name);
    }

    async getUserName(): Promise<string | null> {
        return await this._storage?.get('user_name');
    }

    // -----------------------
    // BUDGETS
    // -----------------------

    async addBudget(budget: Budget) {
        this.budgets.push(budget);
    }

    async getBudgets(): Promise<Budget[]> {
        return this.budgets;
    }
}
