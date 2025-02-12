export interface qualitativeInspectionIF {
    parameter: string;
    passCriteria: string;
    mandatory: boolean;
    pass: string;
    fail: string;
}

export interface quantitativeInspectionIF {
    parameterQty: string;
    uomQty: string;
    mandatoryQty: boolean;
    passCriteriaTarget: string;
    passCriteriaMax: string;
    passCriteriaMin: string;
}