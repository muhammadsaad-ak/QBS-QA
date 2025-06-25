import { NgClass } from '@angular/common';
import { Component, ViewEncapsulation, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { QbsConfirmationDialogIIC } from '../confirmation.types';

@Component({
    selector: 'qbs-confirmation-dialog',
    templateUrl: './dialog-iic.component.html',
    styles: [
        `
            .qbs-confirmation-dialog-panel {
                @screen md {
                    @apply w-128;
                }

                .mat-mdc-dialog-container {
                    .mat-mdc-dialog-surface {
                        padding: 0 !important;
                    }
                }
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatButtonModule, MatDialogModule, MatIconModule, NgClass],
})

export class ComponentQbsConfirmationDialogIIC {
    dataIIC: QbsConfirmationDialogIIC = inject(MAT_DIALOG_DATA);
}
