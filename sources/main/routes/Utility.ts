import { Router } from 'express';
import * as queryAsk from '../queries'
const router = Router();
export default router;

import * as protoGen from '../generated/book'
import * as Library from '../interfaces/Library';
import * as Book from '../interfaces/Book'

import proto = protoGen.book



router.get('/getBook', async (req, res) => {
    if(req.query.ISBN == undefined) {
        res.status(400).send(new proto.BasicMessage({message: "Require ISBN value."}));
        return;
    }
    res.status(200).send(Book.generate_protoBook(await queryAsk.getBookInfo(req.query.ISBN.toString())).toObject())
});


router.post('/changeEmail', async (req: {body: proto.BasicMessage}, res) => {
    if(await queryAsk.changeEmail(req.body.message, req.body.message2)) {
        res.status(200).send(new proto.BasicMessage({message: "Email changed successfully."}).toObject())
        return;
    }
    res.status(500).send(new proto.BasicMessage({message: "Cannot add book."}).toObject())
});