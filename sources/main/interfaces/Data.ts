import * as protoGen from '../generated/book';
import proto = protoGen.book;
import * as utility from '../Utility'

export interface Data {
    Day: number;
    Month: number;
    Year: number;
}

export function defaultData(): Data {
    const data: Data = {Day: -1, Month: -1, Year: -1};
    return data;
}

export function assignVals_JSON(json: any): Data {
    var data = defaultData();
    if(json.hasOwnProperty("month"))
        data = {Day: json.day, Month: json.month, Year: json.year};
    else if(json.hasOwnProperty("Month"))
        data = {Day: json.Day, Month: json.Month, Year: json.Year};
        else
            data = SQL_ToDate(json)
    return data;
}

export function SQL_ToDate(dt: string): Data {
    var data = defaultData();

    let vals = dt.split('T')[0].split('-')
    data.Year = +vals[0]
    data.Month = +vals[1]
    data.Day = +vals[2]
    return data;
}

export function generate_protoBook(json: Data): proto.Data {
    return new proto.Data({Day: json.Day, Month: json.Month, Year: json.Year})
}

export function verify_Basic_DataPresence(json: any): boolean {    
    return (json.Day && json.Month && json.Year)
}

export function toString(data: Data): string {    
    return "ANNO: " + data.Year + " MESE: " + data.Month + " GIORNO: " + data.Day
}
