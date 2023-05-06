import { Router } from 'express';
import * as queryAsk from '../queries'
import axios from 'axios'
const router = Router();
export default router;

import * as protoGen from '../generated/book'
import * as protoGen2 from '../generated/access'
import proto = protoGen.book



router.put('', async (req: {body: proto.AddBook}, res) => {

//TODO INVIARE AL MICROSERVIZIO PER L'ACCESSO, LA RICHIESTA DI PRIVILEGI
    axios.get("https://accesscontrollmicroservice.azurewebsites.net/utility/verifyPrivileges_HIGH")

    const alreadyFound = await queryAsk.getBookInfo(req.body.Libro.ISBN)
    if(alreadyFound.Titolo != "") {
        res.status(400).send(new proto.MessageResponse({message: "Book already exists."}).toObject())
        return;
    }

    if(await queryAsk.addBook(req.body.Libro)) {
        res.status(200).send(new proto.MessageResponse({message: "Booked added successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.MessageResponse({message: "Cannot add book."}).toObject())
});

