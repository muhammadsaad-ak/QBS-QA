import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewEncapsulation,
    inject,
} from '@angular/core';
import { qbsAnimations } from '../../../animations';
import { QbsNavigationService } from '../navigation.service';
import { QbsNavigationItem } from '../navigation.types';
import { QbsUtilsService } from '../../../services/utils/utils.service';
import { ReplaySubject, Subject } from 'rxjs';
import { QbsHorizontalNavigationBasicItemComponent } from './components/basic/basic.component';
import { QbsHorizontalNavigationBranchItemComponent } from './components/branch/branch.component';
import { QbsHorizontalNavigationSpacerItemComponent } from './components/spacer/spacer.component';

@Component({
    selector: 'qbs-horizontal-navigation',
    templateUrl: './horizontal.component.html',
    styleUrls: ['./horizontal.component.scss'],
    animations: qbsAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'qbsHorizontalNavigation',
    standalone: true,
    imports: [
        QbsHorizontalNavigationBasicItemComponent,
        QbsHorizontalNavigationBranchItemComponent,
        QbsHorizontalNavigationSpacerItemComponent,
    ],
})
export class QbsHorizontalNavigationComponent
    implements OnChanges, OnInit, OnDestroy
{
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _qbsNavigationService = inject(QbsNavigationService);
    private _qbsUtilsService = inject(QbsUtilsService);

    @Input() name: string = this._qbsUtilsService.randomId();
    @Input() navigation: QbsNavigationItem[];

    onRefreshed: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On changes
     *
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        // Navigation
        if ('navigation' in changes) {
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Make sure the name input is not an empty string
        if (this.name === '') {
            this.name = this._qbsUtilsService.randomId();
        }

        // Register the navigation component
        this._qbsNavigationService.registerComponent(this.name, this);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Deregister the navigation component from the registry
        this._qbsNavigationService.deregisterComponent(this.name);

        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Refresh the component to apply the changes
     */
    refresh(): void {
        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Execute the observable
        this.onRefreshed.next(true);
    }

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
