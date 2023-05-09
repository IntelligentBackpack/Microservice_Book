import request from 'supertest';
import app, { response } from '../main/app';
import * as protoGen from '../main/generated/book';
import proto = protoGen.book;
import * as Book from '../main/interfaces/Book'
import * as data from '../main/interfaces/Data'

jest.setTimeout(10000);

var myBook: proto.Book = new proto.Book({ISBN: randomISBN(), Titolo: "Test book", Autore: "Test Autore", Data_Pubblicazione: new proto.Data({Year: 6969, Month: 6, Day: 9})})
var myLibrary: proto.BasicMessage = new proto.BasicMessage({message: "admin"})

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



describe("create route functionality", function() {
    describe("testing create book", function() {
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
    
        it.skip("should give permission error when creating a book",async () => {
            const serverResponse = await request(app).put('/create/book').send(new proto.BookActions_WithPermission({email_esecutore: "gesu", Libro: myBook}).toObject());
            expect(serverResponse.statusCode).toBe(401)
            expect(serverResponse.body.message).toBe("No privileges for adding a book.")
        })
    })

    describe("testing create library", function() {
        it("should create a new library",async () => {
            const serverResponse = await request(app).put('/create/library').send(myLibrary.toObject())
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("Libreria created successfully.")
        })
    
        it("should give error 400 for library already existing", async() => {
            const serverResponse = await request(app).put('/create/library').send(myLibrary.toObject());
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("There is already a library associated to that email.")
        })

        it("should give error 401 for no email found on cretion library", async() => {
            const serverResponse = await request(app).put('/create/library').send(new proto.BasicMessage({message: randomISBN()}));
            expect(serverResponse.statusCode).toBe(401)
            expect(serverResponse.body.message).toBe("There are no email existing as the one you specified.")
        })
    })

    describe("testing buy book", function() {
        it("should give error 400 for no book associated with ISBN",async () => {
            const serverResponse = await request(app).put('/create/buyBook').send((new proto.BuyBook({ISBN: randomISBN(), RFID: randomISBN(), emailCompratore: "admin"})).toObject())
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("There isn't any book associated with the specified ISBN.")
        })
    
        it("should give error 400 for no library associated with email", async() => {
            const serverResponse = await request(app).put('/create/buyBook').send((new proto.BuyBook({ISBN: myBook.ISBN, RFID: randomISBN(), emailCompratore: "sdfsf"}).toObject()));
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("There isn't any library associated with the specified email.")
        })

        it("should give error 400 for wrong RFID length", async() => {
            const serverResponse = await request(app).put('/create/buyBook').send((new proto.BuyBook({ISBN: myBook.ISBN, RFID: (randomISBN()), emailCompratore: "admin"}).toObject()));
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("RFID have to have a length of 20.")
        })

        it("should create the copy", async() => {
            const serverResponse = await request(app).put('/create/buyBook').send((new proto.BuyBook({ISBN: myBook.ISBN, RFID: "04:22:03:C2:DA:51:85", emailCompratore: "admin"}).toObject()));
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("Copy added successfully.")
        })

        it("should failed for RFID already taken", async() => {
            const serverResponse = await request(app).put('/create/buyBook').send((new proto.BuyBook({ISBN: myBook.ISBN, RFID: "04:22:03:C2:DA:51:85", emailCompratore: "admin"}).toObject()));
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("RFID already exists.")
        })
    })
})




describe.skip("testing utility functionality", function() {
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
            expect(serverResponse.body.Data_Pubblicazione.Day).toBe(5)
            expect(serverResponse.body.Data_Pubblicazione.Month).toBe(1)
            expect(serverResponse.body.Data_Pubblicazione.Year).toBe(2016)
        })
    })
})




function randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomISBN(): string {
    var str: string = ""
    for (let index = 0; index < 3; index++) {
        str += randomIntFromInterval(1000, 9999) + "-"
    }
    str += randomIntFromInterval(10, 99).toString()
    return str;
}