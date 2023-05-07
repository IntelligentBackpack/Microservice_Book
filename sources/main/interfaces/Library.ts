import * as protoGen from '../generated/book';
import proto = protoGen.book;
import * as Data from './Data';

export interface Library {
    ID: number;
    Email: string
}

export function defaultLibrary(): Library {

    const library: Library = {ID: -1, Email: ""};
    return library;
}

export function assignVals_JSON(json: any): Library {
    var library = defaultLibrary();
    if(json.hasOwnProperty("email"))
        library = {ID: json.ID, Email: json.email};
    else
        library = {ID: json.ID, Email: json.Email};
    return library;
}

export function generate_protoLibrary(json: Library): proto.Library {
    return new proto.Library({ID: json.ID, Email: json.Email})
}

export function verify_Basic_DataPresence(json: any): boolean {    
    return (json.ID && json.RFID)
}

export function toString(library: Library): string {    
    return "ID: " + library.ID + " Email: " + library.Email
}

export function isAssigned(library: Library): boolean {
    return library.Email != "" && library.ID != -1
}