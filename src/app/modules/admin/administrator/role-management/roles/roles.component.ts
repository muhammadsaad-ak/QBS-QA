import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { NestedTreeControl } from '@angular/cdk/tree';
import {
    AsyncPipe,
    CommonModule,
    NgClass,
    NgTemplateOutlet,
} from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    Optional,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { RoleManagementService } from 'app/core/other-core-services/administrator/role-management.service';
import { RoleNode } from '../role-management.types';
import { AddRoleComponent } from './add-role/add-role.component';


// function transformTreeData(data) {
//   return data.map(module => ({
//     name: module.name.replace(' Module', ''),
//     expanded: false,
//     checked: false,
//     children: module.documents.map(doc => ({
//       name: doc.name,
//       expanded: false,
//       checked: false,
//       children: doc.tabs.map(tab => ({
//         name: tab.name,
//         expanded: false,
//         checked: false,
//         children: tab.fields?.map(field => ({ name: field.name, checked: false })) || []
//       }))
//     }))
//   }));
// }

// function transformTreeData(data) {
//     return data.map((module) => ({
//         name: module.name.replace(' Module', ''),
//         expanded: false,
//         checked: false,
//         children: module.documents.map((doc) => ({
//             name: doc.name,
//             expanded: false,
//             checked: false,
//             children: doc.tabs.map((tab) => ({
//                 name: tab.name,
//                 expanded: false,
//                 checked: false,
//                 children:
//                     tab.fields?.map((field) => ({
//                         name: field.name,
//                         checked: field.checked,
//                         authType: field.authType,
//                         mandatory: field.mandatory,
//                     })) || [],
//             })),
//         })),
//     }));
// }

@Component({
    selector: 'app-roles',
    standalone: true,
    templateUrl: './roles.component.html',
    styleUrl: './roles.component.scss',
    encapsulation: ViewEncapsulation.None,
    imports: [
        RouterOutlet,
        MatSidenavModule,
        AsyncPipe,
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatButtonToggleModule,
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
        NgClass,
        NgTemplateOutlet,
        ReactiveFormsModule,
        MatTableModule,
        MatTreeModule,
    ],
})
export class RolesComponent implements OnInit, OnDestroy {
    addRoleBtn = 'Add Role';

    treeControl = new NestedTreeControl<RoleNode>((node) => node.children);
    dataSource = new MatTreeNestedDataSource<RoleNode>();

    //Roles Dropdown
    roles: { id: number; name: string }[] = [];
    selectedRole: number | null = null; // Holds the selected role ID
    role: any = null; // Holds the selected role details

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        @Optional() public _matDialog: MatDialog,
        private _scrollStrategyOptions: ScrollStrategyOptions,
        private _roleManagementService: RoleManagementService,
        private cdr: ChangeDetectorRef
    ) {
        // this.dataSource.data = transformTreeData(TREE_DATA);
    }


    hasChild = (_: number, node: RoleNode) =>
        !!node.children && node.children.length > 0;

    checkedNodes: any[] = []; // To store checked nodes
    storedTransformedData: any[] = [];
    // onNodeChecked(node: any): void {
    //   console.log(node)
    //   node.checked = !node.checked;
    //   if (node.checked) {
    //     this.checkedNodes.push(node);
    //   } else {
    //     this.checkedNodes = this.checkedNodes.filter(n => n !== node);
    //   }
    // }

    onNodeChecked(node: any, checked: boolean): void {
        console.log(node);
        // Toggle the checked state of the node
        node.checked = checked;

        // Expand or collapse node based on its checked state
        if (node.checked) {
            // this.treeControl.expand(node);
            // Check if the node is found in storedTransformedData (tabs array)
            const tabNode = this.findTabNode(
                node.id,
                this.storedTransformedData
            );
            if (tabNode) {
                // If it's a tab, call the API
                this.updateDocTab(tabNode.docCode, tabNode.tab.id, true); // Pass the node id and the checked status
            }
            this.uncheckChildren(node);
            this.checkedNodes.push(node);
        } else {
            // this.treeControl.collapse(node);
            // Check if the node is found in storedTransformedData (tabs array)
            const tabNode = this.findTabNode(
                node.id,
                this.storedTransformedData
            );
            if (tabNode) {
                // If it's a tab, call the API with 'false' for unchecked
                this.updateDocTab(tabNode.docCode, tabNode.tab.id, false);
            }
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

    // Method to find the tab node in storedTransformedData
    private findTabNode(nodeId: string, data: any[]): any | null {
        for (const module of data) {
            for (const document of module.documents) {
                for (const tab of document.tabs) {
                    if (tab.id === nodeId) {
                        return {
                            tab: tab,
                            docCode: document.id, // Assuming `docCode` is on the document object
                        };
                    }
                }
            }
        }
        return null; // Return null if tab is not found
    }

    // API call to update the tab state
    private updateDocTab(docId: string, tabId: string, isChecked: boolean): void {

        const roleId = this.selectedRole;


        const payload = {
            roleId: roleId,
            docCode: docId, // You can use the appropriate doc code here
            tabCode: tabId,
            isChecked: isChecked,
        };

        console.log('updateDocTab payload:', payload);
        this._roleManagementService.updateDocTab(payload).subscribe(
            (response) => {
                console.log('Tab update response:', response);
            },
            (error) => {
                console.error('Error updating tab:', error);
            }
        );
    }

    // Recursively uncheck all child nodes
    // uncheckChildren(node: any): void {
    //   if (node.children && node.children.length > 0) {
    //     node.children.forEach((child: any) => {
    //       child.checked = false; // Uncheck the child node
    //       this.checkedNodes = this.checkedNodes.filter(n => n !== child); // Remove the child from the checked nodes array
    //       // Recursively uncheck the child's children
    //       this.uncheckChildren(child);
    //     });
    //   }
    // }
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
                // this.loadNodeChildren(node);
            }
        }
    }

    // Logic for loading children dynamically if needed
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
        // Check if node has children and at least one child has 'authType' property
        return (
            node.children?.length &&
            node.children.some((child) => child.authType !== undefined)
        );
    }

    // Function to check if a node has any checked children
    // hasCheckedChildren(node: any): boolean {
    //   // Assuming `node.children` holds the child nodes
    //   return node.children && node.children.some(child => this.checkedNodes.includes(child));
    // }

    // Function to retrieve checked children of a specific node
    // checkedChildren(node: any): any[] {
    //   return node.children ? node.children.filter(child => this.checkedNodes.includes(child)) : [];
    // }

    ngOnInit(): void {
        console.log('NgOnInit');
        // Fetch roles from the API when the component initializes
        this._roleManagementService.listAllRoles().subscribe((response) => {
            if (response.succeeded) {
                this.roles = response.data.map((role) => ({
                    id: role.id,
                    name: role.name,
                }));
            }
        });
    }

    onRoleChange(): void {
        if (this.selectedRole) {
            console.log('');
            // Fetch the role details based on the selected role ID
            this._roleManagementService
                .getRoleByID(this.selectedRole)
                .subscribe(
                    (response) => {
                        this.dataSource.data = response.data.children;
                        this.storedTransformedData = this.transformTreeData(
                            response.data.children
                        );
                        console.log(
                            'Transformed Data =>',
                            this.storedTransformedData
                        );
                        console.log('Role details:', this.role);
                    },
                    (error) => {
                        console.error('Error fetching role details:', error);
                    }
                );
        }
    }

    /**
     * Recursively adds `expanded: false` to each node in the tree data.
     */
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

        console.log('ADDS', result);
        return result;
    }

    ngOnDestroy(): void {
        console.log('NgOnDestroy');
    }

    openAddEmployeeDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '1200px';
        dialogConfig.height = '1000px';
        dialogConfig.scrollStrategy = this._scrollStrategyOptions.block();

        this._matDialog
            .open(AddRoleComponent, dialogConfig)
            .afterClosed()
            .subscribe(() => {
                this._router.navigate(['./'], {
                    relativeTo: this._activatedRoute,
                });
            });
    }

    onSubmit(): void {
        console.log(this.checkedNodes);
    }
}
