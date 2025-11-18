import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    private _storage: Storage | null = null;
    private storage = inject(Storage);


    constructor() {
        this.init();
    }

    async init() {
        this._storage = await this.storage.create();
    }


    async set(key: string, value: any) {
        if (!this._storage) await this.init();
        await this._storage?.set(key, value);
    }

    async get(key: string) {
        if (!this._storage) await this.init();
        return await this._storage?.get(key);
    }

    async remove(key: string) {
        if (!this._storage) await this.init();
        await this._storage?.remove(key);
    }

    async getAppState(): Promise<any> {
        if (!this._storage) await this.init();
        const state = await this.get('app_state');
        if (state) return state;
        const defaultState = { user: { name: null, pass: null, budget: null } };
        await this.set('app_state', defaultState);
        return defaultState;
    }

    async setAppState(state: any): Promise<void> {
        if (!this._storage) await this.init();
        await this.set('app_state', state);
    }
}
