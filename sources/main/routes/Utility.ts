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
    const resQ: Book.Book = await queryAsk.getBookInfo(req.query.ISBN.toString())
    const gen: proto.Book = Book.generate_protoBook(resQ) 
    res.status(200).send(gen.toObject())
});


