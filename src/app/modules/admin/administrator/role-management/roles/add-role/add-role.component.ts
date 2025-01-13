import { ScrollingModule } from '@angular/cdk/scrolling';
import { TextFieldModule } from '@angular/cdk/text-field';
import { NestedTreeControl } from '@angular/cdk/tree';
import {
    AsyncPipe,
    CommonModule,
    DatePipe,
    NgClass,
    NgTemplateOutlet,
} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    Optional,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { qbsAnimations } from '@qbs/animations';
import { QbsLoadingBarComponent } from '@qbs/components/loading-bar';
import { QbsFindByKeyPipe } from '@qbs/pipes/find-by-key';
import { RoleManagementService } from 'app/core/other-core-services/administrator/role-management.service';
import { Observable } from 'rxjs';
import { RoleField, RoleNode } from '../../role-management.types';


function transformCheckedNodes(checkedNodes: RoleNode[]): any {
    const generateId = (prefix: string, name: string) =>
        `${prefix}-${name.toLowerCase().replace(/\s+/g, '-')}`;

    const mapFields = (fields: RoleField[] = []) =>
        fields.map((field) => ({
            id: field.id,
            fieldId: field.fieldId,
            name: field.name,
            checked: field.checked,
            expanded: false,
            authType: "no-authorization",
            mandatory: field.mandatory,
        }));

    const mapTabs = (tabs: RoleNode[] = []) =>
        tabs.map((tab) => ({
            id: tab.id,
            name: tab.name,
            checked: tab.checked,
            expanded: false,
            // fields: mapFields(tab.fields || []), // Ensure fields are mapped here
            children: mapFields(tab.children || []), // Recursively handle nested tabs if needed
        }));

    const mapDocuments = (documents: RoleNode[] = []) =>
        documents.map((doc) => ({
            id: doc.id,
            name: doc.name,
            checked: doc.checked,
            expanded: false,
            children: mapTabs(doc.children || []), // Ensure tabs are processed correctly
            // fields: mapFields(doc.fields || []), // Add fields directly on documents if present
        }));

    const mapModules = (modules: RoleNode[] = []) =>
        modules.map((module) => ({
            id: module.id,
            name: `${module.name}`,
            checked: module.checked,
            expanded: false,
            children: mapDocuments(module.children || []),
        }));

    // Assuming the `checkedNodes` array contains modules, return the transformed structure
    return mapModules(checkedNodes); // Return the single root node payload
}




@Component({
    selector: 'app-add-role',
    standalone: true,
    templateUrl: './add-role.component.html',
    styleUrl: './add-role.component.scss',
    animations: qbsAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatTooltipModule,
        AsyncPipe,
        CommonModule,
        DatePipe,
        QbsFindByKeyPipe,
        FormsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatOptionModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSortModule,
        MatSlideToggleModule,
        MatTabsModule,
        NgClass,
        NgTemplateOutlet,
        ReactiveFormsModule,
        RouterLink,
        RouterOutlet,
        TextFieldModule,
        MatStepperModule,
        MatRadioModule,
        MatTableModule,
        MatTreeModule,
        ScrollingModule,
        QbsLoadingBarComponent,
    ],
})
export class AddRoleComponent implements OnInit, OnDestroy {
    addNewRole: FormGroup;

    myControl = new FormControl('');

    treeControl = new NestedTreeControl<RoleNode>((node) => node.children);
    dataSource = new MatTreeNestedDataSource<RoleNode>();

    
    checkedNodes: any[] = [];
    storedTransformedData: any[] = [];

    constructor(
        private fb: FormBuilder,
        @Optional() public matDialogRef: MatDialogRef<AddRoleComponent>,
        private cdr: ChangeDetectorRef,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _roleManagementService: RoleManagementService
    ) {
        this.addNewRole = this.fb.group({
            roleName: new FormControl(''),
        });
    }

    hasChild = (_: number, node: RoleNode) =>
        !!node.children && node.children.length > 0;
    
    ngOnDestroy(): void {}

    ngOnInit() : void {
        this.fetchTreeData();
    }

    private fetchTreeData() {
        this._roleManagementService.getAllData().subscribe({
            next: (roles) => {
                // const treeData = roles;
                // console.log('TREE DATA:', treeData);
                this.dataSource.data = roles.data;
                this.storedTransformedData = this.transformTreeData(
                    roles.data
                );
                console.log('storedTransformedData',this.storedTransformedData)
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load roles data:', err);
            },
        });
    }

    private transformTreeData(data: any[]): any[] {
        const result = data.map((module) => ({
            name: module.name.replace(' Module', ''),
            expanded: false,
            checked: false,
            id: module.id,
            documents: module.children.map((doc) => ({
                name: doc.name,
                expanded: false,
                checked: false,
                id: doc.id,
                tabs: doc.children.map((tab) => ({
                    name: tab.name,
                    expanded: false,
                    checked: false,
                    id: tab.id,
                    fields:
                        tab.children?.map((field) => ({
                            id: field.id,
                            fieldId: field.fieldId,
                            name: field.name,
                            checked: field.checked,
                            authType: field.authType,
                            mandatory: field.mandatory,
                        })) || [],
                })),
            })),
        }));

        return result;
    }

    onNodeChecked(node: any, checked: boolean): void {
        console.log(node);
        // Toggle the checked state of the node
        node.checked = checked;

        // If the node is checked, check all its child nodes
        if (node.checked) {
            this.uncheckChildren(node);
            this.checkedNodes.push(node);
        } else {
            // If the node is unchecked, uncheck all its child nodes
            this.checkedNodes = this.checkedNodes.filter((n) => n !== node);
            this.uncheckChildren(node);
        }
        
    }

    uncheckChildren(node: any): void {
        if (node.children && node.children.length > 0) {
            node.children.forEach((child: any) => {
                child.checked = false; // Uncheck the child node
                this.checkedNodes = this.checkedNodes.filter(
                    (n) => n !== child
                ); // Remove the child from the checked nodes array

                // Recursively uncheck the child's children
                this.uncheckChildren(child);
            });
        }
    }

    
    toggleNode(node: any): void {
      // Check if the node is checked before allowing expansion
      if (!node.checked) {
        console.warn('Node is not checked and cannot be expanded:', node);
        return; // Exit if the node is not checked
      }
    
      // Toggle the expanded state of the node
      if (this.treeControl.isExpanded(node)) {
        this.treeControl.collapse(node);
      } else {
        this.treeControl.expand(node);
    
        // If children have not been loaded yet, perform additional actions
        if (!node.childrenLoaded) {
          console.log(`Loading children for node: ${node.name}`);
        //   this.loadNodeChildren(node);
        const shouldRenderTable = this.shouldRenderTable(node);
        console.log(shouldRenderTable);
        }
      }
    }
    
    private loadNodeChildren(node: any): void {
      // Simulate dynamic child loading
      if (!node.children || node.children.length === 0) {
        console.log(`No children available for node: ${node.name}`);
        node.childrenLoaded = true; // Mark as loaded
        return;
      }
    
      // If children exist but are not loaded yet
      if (!node.childrenLoaded) {
        node.children = node.children.map((child: any) => ({
          ...child,
          checked: false,
          expanded: false,
          children: child.children || [], // Ensure children are initialized
        }));
        node.childrenLoaded = true; // Mark as loaded
        console.log(`Children loaded for node: ${node.name}`);
      }
    }
    
    
    shouldRenderTable(node: any): boolean {
        const result = node.children?.length && node.children.some((child) => child.authType !== undefined);
        // console.log(`shouldRenderTable for node ${node.name}:`, result);
        return result;
    }
    

    // shouldRenderTable(node: any): boolean {
    //     // Find the matching node in storedTransformedData by ID
    //     const matchedNode = this.findNodeById(this.storedTransformedData, node.id);

    //     // Check if the matched node exists and has tabs and fields
    //     return (
    //         matchedNode &&
    //         matchedNode.documents?.some((doc: any) =>
    //             doc.tabs?.some((tab: any) => tab.fields && tab.fields.length > 0)
    //         )
    //     );
    // }

    private findNodeById(tree: any[], id: string): any {
        for (const item of tree) {
            if (item.id === id) {
                return item;
            }
            if (item.documents) {
                const found = this.findNodeById(item.documents, id);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    transformCheckedNodesToPaylod(checkedNodes: RoleNode[]): any[] {
        const traverseTree = (node: any): any | null => {
            // Recursively process children
            const checkedChildren = node.children
                ?.map(traverseTree)
                .filter((child) => child !== null);
    
            // Return the node with children only if they exist
            const result: any = { ...node };
            if (checkedChildren && checkedChildren.length > 0) {
                result.children = checkedChildren;
            }
    
            return result;
        };
    
        // Process the entire tree
        return this.dataSource.data.map(traverseTree);
    }
    
    transformCheckedNodesToPayload(): any {
        return this.transformCheckedNodesToPaylod(this.checkedNodes);
    }

    onSubmit(): void {
        const name = this.addNewRole.get('roleName')?.value;
        const payload = {
            id: 0,
            name,
            expanded: false,
            children: this.transformCheckedNodesToPayload(),
        };

        console.log('Submitted Payload:', payload);
        this._roleManagementService.addRole(payload).subscribe({
            next: (response) => {
              console.log('Role added successfully:', response);
              this.matDialogRef.close();
              this._router.navigate(['../'], {relativeTo: this._activatedRoute});
            },
            error: (error) => {
              console.error('Failed to add role:', error);
            }
          });
    }

    closeDialog(): void {
        this.matDialogRef.close();
        this._router.navigate(['../'], {relativeTo: this._activatedRoute});
    }

}
