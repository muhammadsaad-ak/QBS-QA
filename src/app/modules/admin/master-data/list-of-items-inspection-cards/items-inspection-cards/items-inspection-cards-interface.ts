export interface qualitativeInspectionIF {
    qualitativeResultId: any;
    parameter: string;
    passCriteria: string;
    mandatory: boolean;
    isQcCritical: boolean;
    isQcFloor: boolean;
    isQcLab: boolean;
    isDispatch: boolean;
    isIncoming: boolean;
    isTrial: boolean;
    isCoA: boolean;
    pass: string[];
    fail: string[];
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
    passCriteria: string;
    uoMId: string;
    uoMCode: string;
    mandatoryQty: boolean;
    isQcCritical: boolean;
    isQcFloor: boolean;
    isQcLab: boolean;
    isDispatch: boolean;
    isIncoming: boolean;
    isTrial: boolean;
    isCoA: boolean;
    passCriteriaMin: string;
    passCriteriaMax: string;
    passCriteriaTarget: string;
    passCriteriaLowerLimit: string;
    passCriteriaUpperLimit: string;
}