import * as protoGen from '../generated/book';
import proto = protoGen.book;
import * as Data from './Data';

export interface Book {
    ISBN: string;
    Titolo: string;
    Autore: string;
    Data_Pubblicazione: Data.Data;
}

export function defaultBook(): Book {

    const book: Book = {ISBN: "", Titolo: "", Autore: "", Data_Pubblicazione: Data.defaultData()};
    return book;
}

export function assignVals_JSON(json: any): Book {
    var book = defaultBook();
    if(json.hasOwnProperty("titolo"))
        book = {ISBN: json.ISBN, Titolo: json.titolo, Autore: json.autore, Data_Pubblicazione: Data.assignVals_JSON(json.Data_Pubblicazione)};
    else
        book = {ISBN: json.ISBN, Titolo: json.Titolo, Autore: json.Autore, Data_Pubblicazione: Data.assignVals_JSON(json.Data_Pubblicazione)};
    return book;
}

export function generate_protoBook(json: Book): proto.Book {
    return new proto.Book({ISBN: json.ISBN, Titolo: json.Titolo, Autore: json.Autore, Data_Pubblicazione: Data.generate_protoBook(json.Data_Pubblicazione)})
}

export function verify_Basic_DataPresence(json: any): boolean {    
    return (json.ISBN && json.Titolo && json.Autore && json.Data_Pubblicazione)
}

export function toString(book: Book): string {    
    return "ISBN: " + book.ISBN + " TITOLO: " + book.Titolo + " AUTORE: " + book.Autore + " DATA PUBBLICAZIONE: " + Data.toString(book.Data_Pubblicazione)
}

export function isAssigned(book: Book): boolean {
    return book.ISBN != "" && book.Titolo != "" && book.Autore != "" && Data.isAssigned(book.Data_Pubblicazione)
}