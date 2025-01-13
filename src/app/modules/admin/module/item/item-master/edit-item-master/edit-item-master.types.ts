export interface ItemMasterDataList {
    // GENERAL - BASIC INFORMATION
    seriesid: number,
    itemNo: string,
    description: string,
    foreignName: string,
    itemGroupid: number,
    itemGroup: string,
    uOMGroupId: number,
    uOMGroup: string,
    // GENERAL - ITEM TYPE
    itemId: number,
    itemType: string,
    isInventoryItem: boolean,
    isSalesItem: boolean,
    isPurchasingItem: boolean,
    // GENERAL - PREFERENCES
    manufacturerId: number,
    shippingType: number,
    advanceRuleTypeId: number,
    regionId: number,
    isActive: boolean,
    isActiveFromDate: Date,
    isActiveToDate: Date,
    isActiveRemarks: string,
    isInactive: boolean,
    isInactiveFromDate: Date,
    isInactiveToDate: Date,
    isInactiveRemarks: string,
    // GENERAL - ITEMS CLASSIFICATION
    standardItemIdentificationId: number,
    commodityClassificationId: number,
}