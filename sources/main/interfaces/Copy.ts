import * as protoGen from '../generated/book';
import proto = protoGen.book;
import * as Data from './Data';
import { json } from 'body-parser';

export interface Copy {
    RFID: string;
    ISBN: string;
    ID_Libreria: number;
    Email_Proprietario: string;
}

export function defaultCopy(): Copy {

    const copy: Copy = {RFID: "", ISBN: "", ID_Libreria: -1, Email_Proprietario: ""};
    return copy;
}

export function assignVals_JSON(json: any): Copy {
    var copy = defaultCopy();
    copy = {RFID: json.RFID, ISBN: json.ISBN, ID_Libreria: json.ID_Libreria, Email_Proprietario: json.Email_Proprietario};
    return copy;
}

export function generate_protoCopy(json: Copy): proto.Copy {
    return new proto.Copy({RFID: json.RFID, ISBN: json.ISBN, ID_Libreria: json.ID_Libreria, Email_Proprietario: json.Email_Proprietario})
}

export function verify_Basic_DataPresence(json: any): boolean {    
    return (json.RFID && json.ISBN && json.ID_Libreria && json.Email_Proprietario)
}

export function toString(copy: Copy): string {    
    return "RFID: " + copy.RFID + " ISBN: " + copy.ISBN + " ID_Libreria: " + copy.ID_Libreria + " Email proprietario: " + copy.Email_Proprietario
}

export function isAssigned(copy: Copy): boolean {
    return copy.RFID != "" && copy.ISBN != "" && copy.ID_Libreria != -1 && copy.Email_Proprietario != ""
}