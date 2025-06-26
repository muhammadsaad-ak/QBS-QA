import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SessionStorageService {

    clearStepperData(): void {
        const keysToRemove = [
            'stepperDataQR',
            'stepperDataUOM',
            'stepperDataIA',
            'stepperDataICH',
            'stepperDataIC',
            'stepperDataIS',
            'stepperDataIIC',
            'stepperDataIICNew',
        ];

        keysToRemove.forEach(key => sessionStorage.removeItem(key));
    }

    clearAll(): void {
        sessionStorage.clear();
    }
}
