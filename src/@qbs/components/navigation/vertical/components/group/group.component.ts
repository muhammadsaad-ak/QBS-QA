import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    forwardRef,
    inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { QbsNavigationService } from '../../../navigation.service';
import { QbsNavigationItem } from '../../../navigation.types';
import { QbsVerticalNavigationBasicItemComponent } from '../../components/basic/basic.component';
import { QbsVerticalNavigationCollapsableItemComponent } from '../../components/collapsable/collapsable.component';
import { QbsVerticalNavigationDividerItemComponent } from '../../components/divider/divider.component';
import { QbsVerticalNavigationSpacerItemComponent } from '../../components/spacer/spacer.component';
import { QbsVerticalNavigationComponent } from '../../vertical.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'qbs-vertical-navigation-group-item',
    templateUrl: './group.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgClass,
        MatIconModule,
        QbsVerticalNavigationBasicItemComponent,
        QbsVerticalNavigationCollapsableItemComponent,
        QbsVerticalNavigationDividerItemComponent,
        forwardRef(() => QbsVerticalNavigationGroupItemComponent),
        QbsVerticalNavigationSpacerItemComponent,
    ],
})
export class QbsVerticalNavigationGroupItemComponent
    implements OnInit, OnDestroy
{
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_autoCollapse: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _qbsNavigationService = inject(QbsNavigationService);

    @Input() autoCollapse: boolean;
    @Input() item: QbsNavigationItem;
    @Input() name: string;

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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
