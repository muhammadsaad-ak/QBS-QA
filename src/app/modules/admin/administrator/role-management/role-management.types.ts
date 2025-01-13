export interface RoleField {
  id: string;
  fieldId: number;
  name: string;
  checked: boolean;
  expanded?: boolean;
  authType: 'authorization' | 'no-authorization' | 'read-only';
  mandatory: boolean;
}


export interface RoleNode {
  id: string;
  name: string;
  children?: RoleField[]; // Only nested nodes
  fields?: RoleField[]; // Only leaf nodes with fields
  authType?: string;
  mandatory?: boolean;
  expanded?: boolean;
  checked?: boolean;
  disabled?: boolean;
}