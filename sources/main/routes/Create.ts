import { Router } from 'express';
import * as queryAsk from '../queries'
const router = Router();
export default router;
import request from 'supertest';

import * as protoGen from '../generated/book'
import * as protoGen2 from '../generated/access'
import proto = protoGen.book
import proto2 = protoGen2.access
import * as Book from '../interfaces/Book';
import * as Library from '../interfaces/Library';

const AccessMicroserviceURL:string = "https://accessmicroservice.azurewebsites.net"

router.put('/book', async (req: {body: proto.BookActions_WithPermission}, res) => {
    const serverResponse = await request(AccessMicroserviceURL).get('/utility/verifyPrivileges_HIGH').query({ email: req.body.email_esecutore });
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "No privileges for adding a book."}).toObject())
        return;
    }
    const alreadyFound = await queryAsk.getBookInfo(req.body.Libro.ISBN)
    if(alreadyFound.Titolo != "") {
        res.status(400).send(new proto.BasicMessage({message: "Book already exists."}).toObject())
        return;
    }
    if(req.body.Libro.ISBN.length != 17) {
        res.status(400).send(new proto.BasicMessage({message: "ISBN have to be 17 characters long."}).toObject())
        return;
    }
    if(await queryAsk.addBook(req.body.Libro)) {
        res.status(200).send(new proto.BasicMessage({message: "Booked added successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot add book."}).toObject())
});


router.put('/library', async (req: {body: proto.BasicMessage}, res) => {
    const serverResponse = await request(AccessMicroserviceURL).get('/utility/emailExists').query({ email: req.body.message });
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "There are no email existing as the one you specified."}).toObject())
        return;
    }
    const libraryFound = await queryAsk.getLibreriaByEmail(req.body.message)
    if(Library.isAssigned(libraryFound)) {
        res.status(400).send(new proto.BasicMessage({message: "There is already a library associated to that email."}).toObject())
        return;
    }
    if(await queryAsk.registerLibrary(req.body.message)) {
        res.status(200).send(new proto.BasicMessage({message: "Libreria created successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot add the library."}).toObject())
});


router.put('/buyBook', async (req: {body: proto.BuyBook}, res) => {    
    const bookExists = await queryAsk.getBookInfo(req.body.ISBN)
    if(!Book.isAssigned(bookExists)) {
        res.status(400).send(new proto.BasicMessage({message: "There isn't any book associated with the specified ISBN."}).toObject())
        return;
    }

    const libraryExists = await queryAsk.getLibreriaByEmail(req.body.emailCompratore)
    if(!Library.isAssigned(libraryExists)) {
        res.status(400).send(new proto.BasicMessage({message: "There isn't any library associated with the specified email."}).toObject())
        return;
    }

    if(req.body.RFID.length > 40) {
        res.status(400).send(new proto.BasicMessage({message: "RFID have to be max 40 chars long."}).toObject())
        return;
    }

    if(await queryAsk.verifyRFIDExists(req.body.RFID)) {
        res.status(400).send(new proto.BasicMessage({message: "RFID already exists."}).toObject())
        return;
    }
    
    if(await queryAsk.buyBook(req.body.RFID, req.body.ISBN, libraryExists.ID)) {
        res.status(200).send(new proto.BasicMessage({message: "Copy added successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot add RFID."}).toObject())
});
