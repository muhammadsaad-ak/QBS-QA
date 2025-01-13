import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterOutlet, Router } from '@angular/router';
import { debounceTime, startWith, map } from 'rxjs/operators';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { AsyncPipe, CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { QbsConfirmationService } from '@qbs/services/confirmation';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: string;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 121, name: 'Hydrogen', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 122, name: 'Helium', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 123, name: 'Lithium', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 124, name: 'Beryllium', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 125, name: 'Boron', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 126, name: 'Carbon', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 127, name: 'Nitrogen', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 128, name: 'Oxygen', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 129, name: 'Fluorine', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 130, name: 'Neon', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 131, name: 'Hydrogen', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 132, name: 'Helium', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 133, name: 'Lithium', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 134, name: 'Beryllium', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 135, name: 'Boron', weight: 'Customer', symbol: 'Registered Customer' },
  { position: 136, name: 'Carbon', weight: 'Customer', symbol: 'Registered Customer' },
];

@Component({
  selector: 'app-seller',
  standalone: true,
  imports: [
    MatTableModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, RouterOutlet,
    MatInputModule, MatSortModule, MatTabsModule, ReactiveFormsModule, MatTableModule, FormsModule
  ],
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.scss']
})
export class SellerComponent implements OnInit {

  configForm: UntypedFormGroup;
  searchInputControl: UntypedFormControl = new UntypedFormControl();

  displayedColumns: string[] = ['select', 'position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<PeriodicElement>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  ngOnInit() {
    // Subscribe to search input field value changes to filter the table data
    this.searchInputControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((searchTerm: string) => {
        this.applyFilter(searchTerm);
      });

    // Override the default filterPredicate
    this.dataSource.filterPredicate = (data: PeriodicElement, filter: string) => {
      const transformedFilter = filter.trim().toLowerCase();
      return (
        data.name.toLowerCase().includes(transformedFilter) ||
        data.weight.toLowerCase().includes(transformedFilter) ||
        data.symbol.toLowerCase().includes(transformedFilter)
      );
    };
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
