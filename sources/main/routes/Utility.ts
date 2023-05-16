import { Router } from 'express';
import * as queryAsk from '../queries'
const router = Router();
export default router;

import * as protoGen from '../generated/book'
import * as Book from '../interfaces/Book'
import * as Copy from '../interfaces/Copy'

import proto = protoGen.book



router.get('/getBook', async (req, res) => {
    if(req.query.ISBN == undefined) {
        res.status(400).send(new proto.BasicMessage({message: "Require ISBN value."}));
        return;
    }
    res.status(200).send(Book.generate_protoBook(await queryAsk.getBookInfo(req.query.ISBN.toString())).toObject())
});

router.get('/getCopy/RFID', async (req, res) => {
    if(req.query.RFID == undefined) {
        res.status(400).send(new proto.BasicMessage({message: "Require RFID value."}));
        return;
    }
    res.status(200).send(Copy.generate_protoCopy(await queryAsk.getCopyByRFID(req.query.RFID.toString())).toObject())
});

router.get('/getCopy/Email', async (req, res) => {
    if(req.query.email == undefined) {
        res.status(400).send(new proto.BasicMessage({message: "Require email value."}));
        return;
    }

    const resQ: Copy.Copy[] = await queryAsk.getCopyByEmail(req.query.email.toString())
    res.status(200).send(Copy.generate_protoLibrary(resQ).toObject())
});


router.post('/changeEmail', async (req: {body: proto.BasicMessage}, res) => {
    if(await queryAsk.changeEmail(req.body.message, req.body.message2)) {
        res.status(200).send(new proto.BasicMessage({message: "Email changed successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot change the email."}).toObject())
});