import { Router } from 'express';
import * as queryAsk from '../queries'
import * as book from '../interfaces/Book'
const router = Router();
export default router;

import * as protoGen from '../generated/book'
import proto = protoGen.book



router.get('/getBook', async (req, res) => {
    if(req.query.ISBN == undefined) {
        res.status(400).send(new proto.BasicMessage({message: "Require ISBN value."}));
        return;
    }
    res.status(200).send(book.generate_protoBook(await queryAsk.getBookInfo(+req.query.ISBN)))
});

