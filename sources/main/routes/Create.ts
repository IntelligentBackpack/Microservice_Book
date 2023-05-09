import { Router } from 'express';
import * as queryAsk from '../queries'
import axios from 'axios'
const router = Router();
export default router;

import * as protoGen from '../generated/book'
import proto = protoGen.book
import * as Book from '../interfaces/Book';
import * as Library from '../interfaces/Library';


router.put('/book', async (req: {body: proto.BookActions_WithPermission}, res) => {
    axios.get("https://accesscontrollmicroservice.azurewebsites.net/utility/verifyPrivileges_HIGH?email=" + req.body.email_esecutore).then(function (response) {
        if(response.status != 200) {
            res.status(401).send(new proto.BasicMessage({message: "No privileges for adding a book."}).toObject())
            return;
        }
    })
    
    const alreadyFound = await queryAsk.getBookInfo(req.body.Libro.ISBN)
    if(alreadyFound.Titolo != "") {
        res.status(400).send(new proto.BasicMessage({message: "Book already exists."}).toObject())
        return;
    }

    if(req.body.Libro.ISBN.length != 13) {
        res.status(400).send(new proto.BasicMessage({message: "ISBN have to be 13 characters long."}).toObject())
        return;
    }

    if(await queryAsk.addBook(req.body.Libro)) {
        res.status(200).send(new proto.BasicMessage({message: "Booked added successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot add book."}).toObject())
});

//TODO TEST
router.put('/libreria', async (req: {body: proto.BasicMessage}, res) => {    
    const libraryFound = await queryAsk.getLibreriaByEmail(req.body.message)
    if(Library.isAssigned(libraryFound)) {
        res.status(400).send(new proto.BasicMessage({message: "There is already a library associated to that email."}).toObject())
        return;
    }
    
    if(await queryAsk.registerLibrary(req.body.message)) {
        res.status(200).send(new proto.BasicMessage({message: "RFID added successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot add RFID."}).toObject())
});


//TODO TEST
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
    
    if(await queryAsk.buyBook(req.body.RFID, req.body.ISBN, libraryExists.ID)) {
        res.status(200).send(new proto.BasicMessage({message: "Copy added successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot add RFID."}).toObject())
});
