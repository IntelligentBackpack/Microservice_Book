import request from 'supertest';
import app, { response } from '../main/app';
import * as protoGen from '../main/generated/book';
import proto = protoGen;
import * as book from '../main/interfaces/Book'

jest.setTimeout(20000);

describe("testing basic functionality", function() {
    it("should generate a default Book",  async() => {
        const newBook: book.Book = book.defaultBook();
        expect(newBook.ISBN).toBe(-1)
        expect(newBook.Titolo).toBe("")
        expect(newBook.Autore).toBe("")
        expect(newBook.Data_Pubblicazione.Day).toBe(-1)
        expect(newBook.Data_Pubblicazione.Month).toBe(-1)
        expect(newBook.Data_Pubblicazione.Year).toBe(-1)
    })

    it("should generate a book coming from SQL result",async () => {
        let queryRes = '{"ISBN":1,"Titolo":"Geronimo","Autore":"Stilton","Data_Pubblicazione":"2015-01-15T00:00:00.000Z"}'
        const myBook = book.assignVals_JSON(JSON.parse(queryRes))
        expect(myBook.ISBN).toBe(1)
        expect(myBook.Titolo).toBe("Geronimo")
        expect(myBook.Autore).toBe("Stilton")
        expect(myBook.Data_Pubblicazione.Day).toBe(15)
        expect(myBook.Data_Pubblicazione.Month).toBe(1)
        expect(myBook.Data_Pubblicazione.Year).toBe(2015)
    })

    it("should generate a book coming from Json",async () => {
        let queryRes = '{"ISBN":1,"Titolo":"Geronimo","Autore":"Stilton","Data_Pubblicazione":{"Year":2015,"Month":1,"Day":15}}'
        const myBook = book.assignVals_JSON(JSON.parse(queryRes))
        expect(myBook.ISBN).toBe(1)
        expect(myBook.Titolo).toBe("Geronimo")
        expect(myBook.Autore).toBe("Stilton")
        expect(myBook.Data_Pubblicazione.Day).toBe(15)
        expect(myBook.Data_Pubblicazione.Month).toBe(1)
        expect(myBook.Data_Pubblicazione.Year).toBe(2015)
    })
})