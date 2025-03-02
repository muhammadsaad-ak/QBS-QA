import { Component } from '@angular/core';
// 
import { AsyncPipe, CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { QbsConfirmationService } from '@qbs/services/confirmation';
import { debounceTime } from 'rxjs';
import { itemsCavityIF } from './item-cavity-interface';
import { qbsAnimations } from '@qbs/animations';
// 

@Component({
  selector: 'app-item-cavities',
  standalone: true,
  templateUrl: './item-cavities.component.html',
  styleUrl: './item-cavities.component.scss',
  imports: [
    AsyncPipe,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatDrawer,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatOptionModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatRippleModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSortModule,
    MatSidenavModule,
    MatTableModule,
    MatTabsModule,
    NgClass,
    NgTemplateOutlet,
    ReactiveFormsModule,
    RouterOutlet,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatOptionModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatRippleModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSortModule,
    MatTabsModule,
    MatTableModule,
    ReactiveFormsModule,
  ],
  encapsulation: ViewEncapsulation.None,
  animations: qbsAnimations,
})
export class ItemCavitiesComponent {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  addBtnTitle = "Add"

  // listAllItemsCavity: itemsCavityIF[] = [];
  listAllItemsCavity: itemsCavityIF[] = [
    { itemCode: 'ITM0007653', itemDescription: 'Bottle Inspection', mouldDescription: 'U5-01', noOfCavity: 5 },
    { itemCode: 'ITM0007654', itemDescription: 'Jar Inspection', mouldDescription: 'U5-03', noOfCavity: 15 },
  ];

  displayedColumnsItemsCavity: string[] = ['serialNo', 'itemCode', 'itemDescription', 'mouldDescription', 'noOfCavity', 'action'];

  // dataSourceItemsCavity = new MatTableDataSource<any>([]);
  dataSourceItemsCavity = new MatTableDataSource<any>(this.listAllItemsCavity);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSourceItemsCavity.paginator = this.paginator;
  }

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _qbsConfirmationService: QbsConfirmationService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    // Check if there is updated data from navigation
    const navigationState = history.state.updatedData;
    if (navigationState) {
      const updatedData = navigationState;
      // Now update the listAllItemsCavity with the new data
      this.listAllItemsCavity = this.listAllItemsCavity.map(item =>
        item.itemCode === updatedData.sampleCode ? updatedData : item
      );
      // Refresh the table data source
      this.dataSourceItemsCavity = new MatTableDataSource<any>(this.listAllItemsCavity);
    }

    this.searchInputControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((searchTerm: string) => {
        this.applyFilter(searchTerm);
      });
  }

  ngOnDestroy(): void { }

  applyFilter(searchTerm: string): void {
    searchTerm = searchTerm.trim().toLowerCase();
    this.dataSourceItemsCavity.filter = searchTerm;
  }

  onAddItemCavityClick(): void {
    console.log("CLICKED");
  }
  actionEditItemData(itemData: any): void {
    console.log(itemData);
  }
}
