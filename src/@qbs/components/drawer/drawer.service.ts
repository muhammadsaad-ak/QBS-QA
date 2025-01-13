import { Injectable } from '@angular/core';
import { QbsDrawerComponent } from '../drawer/drawer.component';

@Injectable({ providedIn: 'root' })
export class QbsDrawerService {
    private _componentRegistry: Map<string, QbsDrawerComponent> = new Map<
        string,
        QbsDrawerComponent
    >();

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register drawer component
     *
     * @param name
     * @param component
     */
    registerComponent(name: string, component: QbsDrawerComponent): void {
        this._componentRegistry.set(name, component);
    }

    /**
     * Deregister drawer component
     *
     * @param name
     */
    deregisterComponent(name: string): void {
        this._componentRegistry.delete(name);
    }

    /**
     * Get drawer component from the registry
     *
     * @param name
     */
    getComponent(name: string): QbsDrawerComponent | undefined {
        return this._componentRegistry.get(name);
    }
}
