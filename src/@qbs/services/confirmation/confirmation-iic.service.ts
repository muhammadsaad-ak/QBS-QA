import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { QbsConfirmationDialogIIC } from './confirmation.types';
import { ComponentQbsConfirmationDialogIIC } from './dialog/dialog-iic.component';
import { merge } from 'lodash-es';

@Injectable({ providedIn: 'root' })
// THIS IS SPECIFICALLY FOR IIC (WITH VIEW BUTTON)
export class QbsConfirmationIICService {
    private _matDialog: MatDialog = inject(MatDialog);

    private _qbsConfirmationDialogIIC: QbsConfirmationDialogIIC = {
        title: 'Confirm action',
        message: 'Are you sure you want to confirm this action IIC?',
        icon: {
            show: true,
            name: 'heroicons_outline:exclamation-triangle',
            color: 'warn',
        },
        actions: {
            confirm: {
                show: true,
                label: 'Confirm',
            },
            cancel: {
                show: true,
                label: 'Cancel',
            },
            view: {
                show: true,
                label: 'View',
                color: 'primary',
            },
        },
        dismissible: false,
    };

    openIIC(config: QbsConfirmationDialogIIC = {}): MatDialogRef<ComponentQbsConfirmationDialogIIC> {
        const userConfig = merge({}, this._qbsConfirmationDialogIIC, config);
        return this._matDialog.open(ComponentQbsConfirmationDialogIIC, {
            autoFocus: false,
            disableClose: !userConfig.dismissible,
            data: userConfig,
            panelClass: 'qbs-confirmation-dialog-panel',
        });
    }
}
