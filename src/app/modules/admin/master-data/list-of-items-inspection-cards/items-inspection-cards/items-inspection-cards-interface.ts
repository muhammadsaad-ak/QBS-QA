export interface qualitativeInspectionIF {
    qualitativeResultId: any;
    parameter: string;
    passCriteria: string;
    mandatory: boolean;
    pass: string;
    fail: string;
}
export interface qualitativeResultsInspectionIF {
    id: string;
    intCode: string;
    resultDescription: string;
    passCriteria: boolean;
    failCriteria: boolean;
}
export interface quantitativeInspectionIF {
    parameterQty: string;
    uoMId: string;
    mandatoryQty: boolean;
    passCriteriaTarget: string;
    passCriteriaMax: string;
    passCriteriaMin: string;
}