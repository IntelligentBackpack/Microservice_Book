import { Router } from 'express';
import request from 'supertest';

import * as queryAsk from '../queries'
import axios from 'axios'
const router = Router();
export default router;

import * as protoGen from '../generated/book'
import proto = protoGen.book
import * as Copy from '../interfaces/Copy';

const AccessMicroserviceURL:string = "https://accessmicroservice.azurewebsites.net"


router.delete('/libreria', async (req: {body: proto.BasicMessage}, res) => {
    const libreriaFound = await queryAsk.getCopyByEmail(req.body.message)
    if(Copy.isAssigned(libreriaFound)) {
        res.status(400).send(new proto.BasicMessage({message: "There are some books still assigned to this library. Remove them before."}).toObject())
        return;
    }

    if(await queryAsk.deleteLibraryByEmail(req.body.message)) {
        res.status(200).send(new proto.BasicMessage({message: "Library removed successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot remove library."}).toObject())
});

router.delete('/RFID/single', async (req: {body: proto.BasicMessage}, res) => {
    if(await queryAsk.deleteRFID(req.body.message)) {
        res.status(200).send(new proto.BasicMessage({message: "RFID removed successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot remove RFID."}).toObject())
});

router.delete('/RFID/all', async (req: {body: proto.BasicMessage}, res) => {
    if(await queryAsk.deleteRFID_Email(req.body.message)) {
        res.status(200).send(new proto.BasicMessage({message: "RFIDs removed successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot remove RFIDs."}).toObject())
});

router.delete('/book/ISBN', async (req: {body: proto.BookActions_WithPermission}, res) => {
    const serverResponse = await request(AccessMicroserviceURL).get('/utility/verifyPrivileges_HIGH').query({ email: req.body.email_esecutore });
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "No privileges for deleting a book."}).toObject())
        return;
    }

    if(await queryAsk.verify_ISBN_usedInCopy(req.body.Libro.ISBN)) {
        res.status(400).send(new proto.BasicMessage({message: "The book is register to 1+ RFIDs."}).toObject())
        return;
    }

    if(await queryAsk.deleteBook_ISBN(req.body.Libro.ISBN)) {
        res.status(200).send(new proto.BasicMessage({message: "Book removed successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot remove book."}).toObject())
});

router.delete('/book/Autore', async (req: {body: proto.BasicMessage}, res) => {
    const serverResponse = await request(AccessMicroserviceURL).get('/utility/verifyPrivileges_HIGH').query({ email: req.body.message });
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "No privileges for deleting books."}).toObject())
        return;
    }

    if(await queryAsk.verify_AuthorBook_usedInCopy(req.body.message2)) {
        res.status(400).send(new proto.BasicMessage({message: "Cannot delete all books. 1+ books are associated with 1+ RFIDs."}).toObject())
        return;
    }

    if(await queryAsk.deleteBook_Author(req.body.message2)) {
        res.status(200).send(new proto.BasicMessage({message: "Books removed successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot remove books."}).toObject())
});