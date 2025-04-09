import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-evaluation-plan-qa',
  standalone: true,
  imports: [
     CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatIconModule,
        MatTabsModule,
        MatTableModule,
        MatCheckboxModule
  ],
  templateUrl: './evaluation-plan-qa.component.html',
  styleUrl: './evaluation-plan-qa.component.scss'
})
export class EvaluationPlanQaComponent implements OnInit {

  @ViewChild('dialogTemplateItems') dialogTemplateItems;
  @ViewChild('dialogQaTemplateItems') dialogQaTemplateItems;

  qaDialogRef: any;

  displayedColumnsQualitative: string[] = [
    'parameters',
    'passCriteria',
    'Mandatory',
    'remarks',
  ];
  displayedColumnsQuantitative: string[] = [
    'parameters', 
    'UOM', 
    'Mandatory', 
    'Target', 
    'Max', 
    'Min', 
    'remarks'
  ];

  samples = [
    {
      title: 'Sample 1',
      inspectionTime: '5:00 PM',
      inspectionBy: 'Mr. Asad'
    }
  ];
  
  dataSourceQualitativeInspection: any[] = [];
  dataSourceQuantitativeInspection: any[] = [];
  selectedCavityName: string = '';
  
  constructor(private _formBuilder: FormBuilder, private _dialog: MatDialog) {
    
  }

  cavity = [
    {cName: 'cavity 1', InspectionTime: '10:30 AM', InspectionBy: 'Mr.Kamran'},
    {cName: 'cavity 2', InspectionTime: '10:30 AM', InspectionBy: 'Mr.Kamran'},
    {cName: 'cavity 3', InspectionTime: '10:30 AM', InspectionBy: 'Mr.Kamran'},
    {cName: 'cavity 4', InspectionTime: '10:30 AM', InspectionBy: 'Mr.Kamran'},
    {cName: 'cavity 5', InspectionTime: '10:30 AM', InspectionBy: 'Mr.Kamran'},
  ]

  toggleCavity(cav: any) {
    cav.enabled = !cav.enabled;
    console.log(`${cav.cName} is now ${cav.enabled ? 'Enabled' : 'Disabled'}`);
  }

  ngOnInit(): void {
    const staticData = [
      {
        parameters: 'Color Check',
        passCriteria: 'Should be Blue',
        Mandatory: true,
        qualitativeResultId: 'Passed',
        remarks: 'Looks good',
      },
      {
        parameters: 'Weight Check',
        passCriteria: 'Less than 5kg',
        Mandatory: false,
        qualitativeResultId: 'Failed',
        remarks: 'Overweight',
      },
    ];

    this.dataSourceQualitativeInspection = staticData;

    const formArray = this.evaluationplanQAFormGroup.get('qualitativeInspectionObjects') as FormArray;

    staticData.forEach((item) => {
      formArray.push(
        this._formBuilder.group({
          parameters: [item.parameters],
          passCriteria: [item.passCriteria],
          Mandatory: [item.Mandatory],
          qualitativeResultId: [item.qualitativeResultId],
          remarks: [item.remarks],
        })
      );
    });

    const staticsData = [
      {
        parameters: 'Color Check',
        UOM: 'Should be Blue',
        Mandatory: true,
        Target: 12,
        Max: 3,
        Min: 5,
        results: 'Looks good',
        remarks: 'Looks good'
      },
      {
        parameters: 'Weight Check',
        UOM: 'Less than 5kg',
        Mandatory: false,
        Target: 12,
        Max: 3,
        Min: 5,
        results: 'Looks good',
        remarks: 'Looks good'
      },
    ];

    this.dataSourceQuantitativeInspection = staticsData;

    const formsArray = this.evaluationplanQAFormGroup.get('quantitativeInspectionResults') as FormArray;

    staticsData.forEach((item) => {
      formsArray.push(
        this._formBuilder.group({
          parameters: [item.parameters],
          UOM: [item.UOM],
          Mandatory: [item.Mandatory],
          Target: [item.Target],
          Max: [item.Max],
          Min: [item.Min],
          results: [item.results],
          remarks: [item.remarks]
        })
      );
    });
  }


  get rows() {
    return this.evaluationplanQAFormGroup.get('qualitativeInspectionObjects') as FormArray;
  }

   get rowes() {
    return this.evaluationplanQAFormGroup.get('quantitativeInspectionResults') as FormArray;
  }
  
    evaluationplanQAFormGroup = this._formBuilder.group({
    qcode: [""],
    docNo: [''], 
    itemCode: [""], 
    itemDescription: [''], 
    inspectionDateTime: [new Date().toISOString()],
    prodOrder: [''],
    LotNo: [''], 
    poDate: [new Date().toISOString()], 
    lotSize: [''],
    warehouse: [''], 
    varient: [''], 
    cycleTime: [''],
    itemWeg: [''],
    shift: [''],
    machNo: [''],
    bmrNo: [''],
    mouldNo: [''],
    cavity: [''],
    analyzedBy: [''],
    InspectionBy: [''],
    remarks: [''],
    min: [''],
    max: [''],
    target: [''],
    parameters: ['test'],
    qualitativeInspectionObjects: this._formBuilder.array([]),
    quantitativeInspectionResults: this._formBuilder.array([]),
  });

    onEvaluationPlanQaModal(cav: any): void {

    if (!cav.enabled) return;

     this.selectedCavityName = cav.cName;

    console.log('Opening modal for:', this.selectedCavityName);

    const dialogRef = this._dialog.open(this.dialogTemplateItems, {
        width: '70%',
        height: '75vh',
      })

      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);

        this.closeDialog()
      })
    }

  onCavitySampleQaModal(): void {
    this.qaDialogRef = this._dialog.open(this.dialogQaTemplateItems, {
      width: '70%',
      height: '75vh',
    });

    this.qaDialogRef.afterClosed().subscribe((result) => {
      console.log('QA Dialog Closed:', result);
      this.closeQaManually();
      this.qaDialogRef = null;
    });
  }

  saveAndCloseQa() {
  const inspectionBy = this.evaluationplanQAFormGroup.get('InspectionBy')?.value || 'N/A';
  const newSample = {
    title: `Sample ${this.samples.length + 1}`,
    inspectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    inspectionBy: inspectionBy
  };

  this.samples.push(newSample);
  this.closeQaManually(); 
}

  closeDialog(): void {
        this._dialog.closeAll();
  }

  closeQaManually(): void {
    if (this.qaDialogRef) {
      this.qaDialogRef.close();
    }
  }


}
