// PRICING INTERFACE
export interface pricingIF {
    position: number;
    uomCode: string;
    uomName: string;
    basePrice: number;
    reducedBy: number;
    price: number;
    auto: boolean;
}

// PROPERTIES INTERFACE
export interface propertiesIF {
    propertyID: number;
    propertyName: string;
}

// INVENTORY INTERFACE
export interface inventoryIF {
    position: number;
    warehouseCode: string;
    warehouseName: string;
    isDefaultWH: boolean;
    locked: boolean;
    inStock: number;
    committed: number;
    ordered: number;
    available: number;
    itemCost: number;
}

// LOGISTICS INTERFACE
export interface logisticsIF {
    barcodeID: number;
    barcodeText: string;
    defaultTrue: boolean;
    freeText: string;
}

// PURCHASING INTERFACE
export interface purchasingIF {
    bpID: number;
    bpCode: string;
    bpName: string;
    defaultTrue: boolean;
    priceList: string;
    itemPrice: string;
    lastPrice: string;
}
