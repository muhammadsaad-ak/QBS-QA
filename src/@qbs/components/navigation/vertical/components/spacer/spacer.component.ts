import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { QbsNavigationService } from '../../../navigation.service';
import { QbsNavigationItem } from '../../../navigation.types';
import { QbsVerticalNavigationComponent } from '../../vertical.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'qbs-vertical-navigation-spacer-item',
    templateUrl: './spacer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgClass],
})
export class QbsVerticalNavigationSpacerItemComponent
    implements OnInit, OnDestroy
{
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _qbsNavigationService = inject(QbsNavigationService);

    @Input() item!: QbsNavigationItem;
    @Input() name!: string;

    private _qbsVerticalNavigationComponent: QbsVerticalNavigationComponent;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the parent navigation component
        this._qbsVerticalNavigationComponent =
            this._qbsNavigationService.getComponent(this.name);

        // Subscribe to onRefreshed on the navigation component
        this._qbsVerticalNavigationComponent.onRefreshed
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
