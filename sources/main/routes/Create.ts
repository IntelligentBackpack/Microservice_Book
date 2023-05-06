import { Router } from 'express';
const router = Router();
export default router;

import * as protoGen from '../generated/book'
import proto = protoGen.book

//this route manage the login a user
router.post('', async (req: {body: proto.Book}, res) => {

});

