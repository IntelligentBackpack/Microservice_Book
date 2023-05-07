import { Router } from 'express';
import * as queryAsk from '../queries'
import axios from 'axios'
const router = Router();
export default router;

import * as protoGen from '../generated/book'
import proto = protoGen.book
import * as books from '../interfaces/Book';
import * as Library from '../interfaces/Library';


router.put('/book', async (req: {body: proto.AddBook}, res) => {
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

    if(await queryAsk.addBook(req.body.Libro)) {
        res.status(200).send(new proto.BasicMessage({message: "Booked added successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot add book."}).toObject())
});

//TODO TEST
router.put('/RFID', async (req: {body: proto.RegisterRFID}, res) => {    
    const alreadyFound = await queryAsk.getBookInfo(+req.body.ISBN)
    if(alreadyFound.Titolo == "") {
        res.status(400).send(new proto.BasicMessage({message: "There aren't any books with that ISBN."}).toObject())
        return;
    }

    if(await queryAsk.registerRFID(+req.body.RFID, +req.body.ISBN)) {
        res.status(200).send(new proto.BasicMessage({message: "RFID added successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot add RFID."}).toObject())
});

//TODO TEST
router.put('/libreria', async (req: {body: proto.BasicMessage}, res) => {    
    const libraryFound = await queryAsk.getLibreriaByEmail(req.body.message)
    if(Library.isAssigned(libraryFound)) {
        res.status(400).send(new proto.BasicMessage({message: "There is already a library associated to that email."}).toObject())
        return;
    }
    
    // if(await queryAsk.registerLibrary(req.body.Email)) {
    //     res.status(200).send(new proto.BasicMessage({message: "RFID added successfully."}).toObject())
    //     return;
    // }
    res.status(500).send(new proto.BasicMessage({message: "Cannot add RFID."}).toObject())
});
