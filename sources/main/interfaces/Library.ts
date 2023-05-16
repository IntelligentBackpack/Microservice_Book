import * as protoGen from '../generated/book';
import proto = protoGen.book;
import * as Data from './Data';

export interface Library {
    ID: number;
    Email_Proprietario: string
}

export function defaultLibrary(): Library {

    const library: Library = {ID: -1, Email_Proprietario: ""};
    return library;
}

export function assignVals_JSON(json: any): Library {
    var library = defaultLibrary();
    if(json.hasOwnProperty("email"))
        library = {ID: json.ID, Email_Proprietario: json.email_proprietario};
    else
        library = {ID: json.ID, Email_Proprietario: json.Email_Proprietario};
    return library;
}

export function verify_Basic_DataPresence(json: any): boolean {    
    return (json.ID && json.RFID)
}

export function toString(library: Library): string {    
    return "ID: " + library.ID + " Email Proprietario: " + library.Email_Proprietario
}

export function isAssigned(library: Library): boolean {
    return library.Email_Proprietario != "" && library.ID != -1
}