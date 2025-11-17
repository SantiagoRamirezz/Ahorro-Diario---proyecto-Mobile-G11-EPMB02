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
        await this._storage?.set(key, value);
    }

    async get(key: string) {
        return await this._storage?.get(key);
    }

    async remove(key: string) {
        await this._storage?.remove(key);
    }
}
