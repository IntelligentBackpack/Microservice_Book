import request from 'supertest';
import app, { response } from '../main/app';
import * as protoGen from '../main/generated/book';
import proto = protoGen.book;
import * as Book from '../main/interfaces/Book'

jest.setTimeout(30000);

var myBook: proto.Book = new proto.Book({ISBN: randomISBN(), Titolo: "Test book", Autore: "Test Autore", Data_Pubblicazione: new proto.Data({Year: 6969, Month: 6, Day: 9})})
var myLibrary: proto.BasicMessage = new proto.BasicMessage({message: "admin"})


describe("create route functionality", function() {
    describe("testing create book", function() {
        it("should create a new book", async () => {
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


describe("remove route functionality", function() {
    describe("testing errors from delete library", function() {
        it("should not remove a library because there are still books assigned",async () => {
            const serverResponse = await request(app).delete('/remove/libreria').send(new proto.BasicMessage({message: "admin"}).toObject());
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("There are some books still assigned to this library. Remove them before.")
        })

        it("should remove a library not assigned at anybody",async () => {
            const serverResponse = await request(app).delete('/remove/libreria').send(new proto.BasicMessage({message: "gesù"}).toObject());
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("Library removed successfully.")
        })
    })

    describe("testing delete single RFID", function() {
        it("should remove the RFID",async () => {
            const serverResponse = await request(app).delete('/remove/RFID/single').send(new proto.BasicMessage({message: "04:22:03:C2:DA:51:85"}).toObject());
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("RFID removed successfully.")
        })

        it("should do fine while removing an RFID not existing",async () => {
            const serverResponse = await request(app).delete('/remove/RFID/single').send(new proto.BasicMessage({message: "04:22:03:C2:DA:51:85"}).toObject());
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("RFID removed successfully.")
        })
    })

    it("recreate 2 RFIDs",async () => {
        await request(app).put('/create/buyBook').send((new proto.BuyBook({ISBN: myBook.ISBN, RFID: "04:22:03:C2:DA:51:85", emailCompratore: "admin"}).toObject()));
        await request(app).put('/create/buyBook').send((new proto.BuyBook({ISBN: myBook.ISBN, RFID: "04:22:03:C2:DA:51:86", emailCompratore: "admin"}).toObject()));
    })

    describe("testing errors from removing a single book", function() {
        it("should give permission error while removing the books",async () => {
            const serverResponse = await request(app).delete('/remove/book/ISBN').send(new proto.BookActions_WithPermission({email_esecutore: "gesù", Libro: myBook}).toObject());
            expect(serverResponse.statusCode).toBe(401)
            expect(serverResponse.body.message).toBe("No privileges for deleting a book.")
        })

        it("should give error for others RFIDs still present with given ISBN",async () => {
            const serverResponse = await request(app).delete('/remove/book/ISBN').send(new proto.BookActions_WithPermission({email_esecutore: "admin", Libro: myBook}).toObject());
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("The book is register to 1+ RFIDs.")
        })
    })
    
    describe("testing errors from removing all books of actor", function() {
        it("should give permission error",async () => {
            const serverResponse = await request(app).delete('/remove/book/Autore').send(new proto.BasicMessage({message: "gesù", message2: "Autore ma tanto è inutile qui"}).toObject());
            expect(serverResponse.statusCode).toBe(401)
            expect(serverResponse.body.message).toBe("No privileges for deleting books.")
        })

        it("should give error for books associated with RFIDs",async () => {
            const serverResponse = await request(app).delete('/remove/book/Autore').send(new proto.BasicMessage({message: "admin", message2: "Test Autore"}).toObject());
            console.log(serverResponse.body)
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("Cannot delete all books. 1+ books are associated with 1+ RFIDs.")
        })
    })

    describe("testing delete all RFID by email", function() {
        it("should remove all RFID",async () => {
            const serverResponse = await request(app).delete('/remove/RFID/all').send(new proto.BasicMessage({message: "admin"}).toObject());
            expect(serverResponse.statusCode).toBe(200)
        })
    })

    describe("testing remove single book and by author", function() {
        it("should delete the book",async () => {
            const serverResponse = await request(app).delete('/remove/book/ISBN').send(new proto.BookActions_WithPermission({email_esecutore: "admin", Libro: myBook}).toObject());
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("Book removed successfully.")
        })

        it("create 2 books of the same actor and delete both of them",async () => {
            await request(app).put('/create/book').send(new proto.BookActions_WithPermission({email_esecutore: "admin", Libro: (new proto.Book({ISBN: randomISBN(), Titolo: "Test book", Autore: "Test Autore", Data_Pubblicazione: new proto.Data({Year: 6969, Month: 6, Day: 9})}))}).toObject());
            await request(app).put('/create/book').send(new proto.BookActions_WithPermission({email_esecutore: "admin", Libro: (new proto.Book({ISBN: randomISBN(), Titolo: "Test book", Autore: "Test Autore", Data_Pubblicazione: new proto.Data({Year: 6969, Month: 6, Day: 9})}))}).toObject());
            const serverResponse = await request(app).delete('/remove/book/Autore').send(new proto.BasicMessage({message: "admin", message2: "Test Autore"}).toObject());
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("Books removed successfully.")
        })
    })

    describe("testing delete libreria", function() {
        it("should remove the previus associated library",async () => {
            const serverResponse = await request(app).delete('/remove/libreria').send(new proto.BasicMessage({message: "admin"}).toObject());
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("Library removed successfully.")
        })
    })
})





describe("testing utility functionality", function() {
    const myBook2 = new proto.Book({ISBN: randomISBN(), Titolo: "Test book 2", Autore: "Test Autore", Data_Pubblicazione: new proto.Data({Year: 3845, Month: 12, Day: 5})})
    const myRFID: string[] = ["yesIm_A_ValidRFID123", "yesIm_A_newValidRFID"]
    
    it("create 2 books, 2 RFID and 1 library",async () => {
        await request(app).put('/create/book').send(new proto.BookActions_WithPermission({email_esecutore: "admin", Libro: myBook}).toObject());
        await request(app).put('/create/book').send(new proto.BookActions_WithPermission({email_esecutore: "admin", Libro: myBook2}).toObject());
        
        await request(app).put('/create/library').send(myLibrary.toObject())

        await request(app).put('/create/buyBook').send((new proto.BuyBook({ISBN: myBook.ISBN, RFID: "yesIm_A_ValidRFID123", emailCompratore: "admin"}).toObject()));
        await request(app).put('/create/buyBook').send((new proto.BuyBook({ISBN: myBook2.ISBN, RFID: "yesIm_A_newValidRFID", emailCompratore: "admin"}).toObject()));
    
        expect(1).toBe(1)
    })

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

    describe("testing adding copy to backpack", function() {
        it("should give error for no RFID passed",async () => {
            const serverResponse = await request(app).put('/backpack/addCopies').send(new proto.multipleRFID({}).toObject())
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("You need to add at least 1 copy.")
        })
        it("should give error for no library associated with email",async () => {
            const myRFID: string[] = ["gesù"]
            const serverResponse = await request(app).put('/backpack/addCopies').send(new proto.multipleRFID({RFID: myRFID}).toObject())
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("No library associated with passed email.")
        })
        it("should give error for RFID not existing",async () => {
            const myRFID: string[] = ["csdceef"]
            const serverResponse = await request(app).put('/backpack/addCopies').send(new proto.multipleRFID({email: "admin",RFID: myRFID}).toObject())
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("The RFID passed does not exists.")
        })
        it("should add the RFIDs specified to the backpack",async () => {

            const serverResponse = await request(app).put('/backpack/addCopies').send(new proto.multipleRFID({email: "admin",RFID: myRFID}).toObject())
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("RFIDs added successfully.")
        })
    })

    describe("testing utility methods of backpack", function() {
        it("should get all RFIDs in backpack using email",async () => {
            const serverResponse = await request(app).get('/backpack/getCopiesRFID').send(new proto.BasicMessage({message: "admin"}).toObject())
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.RFID.length).toBe(2)
        })
        it("should get all RFIDs in backpack using email",async () => {
            const serverResponse = await request(app).get('/backpack/getBooksISBN').send(new proto.BasicMessage({message: "admin"}).toObject())
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.RFID.length).toBe(2)
        })
    })

    describe("testing remove backpack copies", function() {
        it("should give error for no RFID assed",async () => {
            const serverResponse = await request(app).delete('/backpack/removeCopies').send(new proto.multipleRFID({}).toObject())
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("You need to remove at least 1 copy.")
        })
        it("should remove the specified RFID",async () => {
            const serverResponse = await request(app).delete('/backpack/removeCopies').send(new proto.multipleRFID({RFID: ["yesIm_A_ValidRFID123"]}).toObject())
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("RFIDs removed successfully.")
        })
        it("should clear the backpack of a specified user passed by email",async () => {
            const serverResponse = await request(app).delete('/backpack/clear').send(new proto.BasicMessage({message: "admin"}).toObject())
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("RFIDs removed successfully.")
        })
    })

    it("Clean the data created",async () => {
        await request(app).delete('/remove/RFID/all').send(new proto.BasicMessage({message: "admin"}).toObject());
        await request(app).delete('/remove/book/Autore').send(new proto.BasicMessage({message: "admin", message2: "Test Autore"}).toObject());
        await request(app).delete('/remove/libreria').send(new proto.BasicMessage({message: "admin"}).toObject());
        expect(1).toBe(1)
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
function randomRFID(): string {
    const characters = '0123456789ABCDEF';
    var str: string = ""
    for (let index = 0; index < 7; index++) {
        str += characters.charAt(Math.floor(Math.random() * characters.length));
        str += characters.charAt(Math.floor(Math.random() * characters.length));
        str += ":"
    }
    str = str.substring(0, str.length - 1)
    return str;
}