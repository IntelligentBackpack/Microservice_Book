import request from 'supertest';
import app, { response } from '../main/app';
import * as protoGen from '../main/generated/book';
import proto = protoGen.book;
import * as Book from '../main/interfaces/Book'
import * as data from '../main/interfaces/Data'

jest.setTimeout(5000);

var myBook: proto.Book = new proto.Book({ISBN: randomIntFromInterval(-999999999, 999999999).toString(), Titolo: "Test book", Autore: "Test Autore", Data_Pubblicazione: new proto.Data({Year: 6969, Month: 6, Day: 9})})

describe.skip("testing basic functionality", function() {
    it("should generate a default Book",  async() => {
        const newBook: Book.Book = Book.defaultBook();
        expect(newBook.ISBN).toBe("")
        expect(newBook.Titolo).toBe("")
        expect(newBook.Autore).toBe("")
        expect(newBook.Data_Pubblicazione.Day).toBe(-1)
        expect(newBook.Data_Pubblicazione.Month).toBe(-1)
        expect(newBook.Data_Pubblicazione.Year).toBe(-1)
    })

    it("should generate a book coming from SQL result",async () => {
        let queryRes = '{"ISBN":"1","Titolo":"Geronimo","Autore":"Stilton","Data_Pubblicazione":"2015-01-15T00:00:00.000Z"}'
        const myBook = Book.assignVals_JSON(JSON.parse(queryRes))
        expect(myBook.ISBN).toBe("1")
        expect(myBook.Titolo).toBe("Geronimo")
        expect(myBook.Autore).toBe("Stilton")
        expect(myBook.Data_Pubblicazione.Day).toBe(15)
        expect(myBook.Data_Pubblicazione.Month).toBe(1)
        expect(myBook.Data_Pubblicazione.Year).toBe(2015)
    })

    it("should generate a book coming from Json",async () => {
        let queryRes = '{"ISBN":"1","Titolo":"Geronimo","Autore":"Stilton","Data_Pubblicazione":{"Year":2015,"Month":1,"Day":15}}'
        const myBook = Book.assignVals_JSON(JSON.parse(queryRes))
        expect(myBook.ISBN).toBe("1")
        expect(myBook.Titolo).toBe("Geronimo")
        expect(myBook.Autore).toBe("Stilton")
        expect(myBook.Data_Pubblicazione.Day).toBe(15)
        expect(myBook.Data_Pubblicazione.Month).toBe(1)
        expect(myBook.Data_Pubblicazione.Year).toBe(2015)
    })
})



describe.skip("create route functionality", function() {
    it("should create a new book",async () => {
        const serverResponse = await request(app).put('/create/book').send(new proto.BookActions_WithPermission({email_esecutore: "admin", Libro: myBook}).toObject());
        expect(serverResponse.statusCode).toBe(200)
        expect(serverResponse.body.message).toBe("Booked added successfully.")
    })

    it("should give error 400 for book already present with ISBN", async() => {
        const serverResponse = await request(app).put('/create/book').send(new proto.BookActions_WithPermission({email_esecutore: "admin", Libro: myBook}).toObject());
        expect(serverResponse.statusCode).toBe(400)
        expect(serverResponse.body.message).toBe("Book already exists.")
    })

    it("should give permission error when creating a book",async () => {
        const serverResponse = await request(app).put('/create/book').send(new proto.BookActions_WithPermission({email_esecutore: "gesù", Libro: myBook}).toObject());
        expect(serverResponse.statusCode).toBe(401)
        expect(serverResponse.body.message).toBe("No privileges for adding a book.")
    })
})


describe("testing utility functionality", function() {
    describe("testing getBook", function() {
        it("should get a default book" ,async () => {
            const serverResponse = await request(app).get('/utility/getBook').query({ISBN: "test"})
            expect(serverResponse.statusCode).toBe(200)
            expect(Book.isAssigned(serverResponse.body)).toBe(false)
        })
    
        it("should get the specified book" ,async () => {
            const serverResponse = await request(app).get('/utility/getBook').query({ISBN: "123456789ABCD"})
            expect(serverResponse.statusCode).toBe(200)
            expect(Book.isAssigned(serverResponse.body)).toBe(true)
            expect(serverResponse.body.ISBN).toBe("123456789ABCD")
            expect(serverResponse.body.Titolo).toBe("Il libro inserito a mano")
            expect(serverResponse.body.Autore).toBe("Il creatore del microservizio")
            console.log(serverResponse.body.Data_Pubblicazione)
        })
    })
})




function randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }