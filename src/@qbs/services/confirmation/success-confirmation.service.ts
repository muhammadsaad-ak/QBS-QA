import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { QbsConfirmationConfig } from './confirmation.types';
import { QbsConfirmationDialogComponent } from './dialog/dialog.component';
import { merge } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class QbsSuccessConfirmationService {
    private _matDialog: MatDialog = inject(MatDialog);
    private _defaultConfig: QbsConfirmationConfig = {
        title: 'Confirm action',
        message: 'Are you sure you want to confirm this action?',
        icon: {
            show: true,
            name: 'heroicons_outline:shield-check',
            color: 'success',
        },
        actions: {
            confirm: {
                show: true,
                label: 'Confirm',
                color: 'primary',
            },
            cancel: {
                show: true,
                label: 'Cancel',
            },
        },
        dismissible: false,
    };

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    open(
        config: QbsConfirmationConfig = {}
    ): MatDialogRef<QbsConfirmationDialogComponent> {
        // Merge the user config with the default config
        const userConfig = merge({}, this._defaultConfig, config);

        // Open the dialog
        return this._matDialog.open(QbsConfirmationDialogComponent, {
            autoFocus: false,
            disableClose: !userConfig.dismissible,
            data: userConfig,
            panelClass: 'qbs-confirmation-dialog-panel',
        });
    }
}
