import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SessionStorageService {

    clearStepperData(): void {
        const keysToRemove = [
            'stepperDataQR',
            'stepperDataUOM',
            'stepperDataICH',
            'stepperDataIC',
            'stepperDataIS',
            'stepperDataIIC'
        ];

        keysToRemove.forEach(key => sessionStorage.removeItem(key));
    }

    clearAll(): void {
        sessionStorage.clear();
    }
}
