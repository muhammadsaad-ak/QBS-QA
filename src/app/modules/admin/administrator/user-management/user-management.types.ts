// export interface User {
//     id: number;
//     email: string;
//     fullName: string;
//     phone?: string;
//     branch?: string;
//     role?: string;
//     department?: string;
//     action?: string;
//   }
  
  export interface UserList {
    id: number;                
    email: string;             
    fullName: string;          
    userName: string;         
    phone1?: string;            
    phone2?: string;           
    branch?: string;           
    role?: string;          
    department?: string;  
    country?: string;         
    address?: string;         
    isSuperUser?: boolean;  
    isLocked?: boolean;       
    isScreenLock?: boolean;    
    password?: string;     
    action?: string;       
}
