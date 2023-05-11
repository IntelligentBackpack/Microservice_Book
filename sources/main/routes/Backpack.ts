import { Router } from 'express';
import * as queryAsk from '../queries'
const router = Router();
export default router;

import * as Copy from '../interfaces/Copy';

import * as protoGen from '../generated/book'
import * as protoGen2 from '../generated/access'
import proto = protoGen.book
import proto2 = protoGen2.access

router.put('/addCopies', async (req: {body: proto.multipleRFID}, res) => {
    if(req.body.RFID.length == 0) {
        res.status(400).send(new proto.BasicMessage({message: "You need to add at least 1 copy."}).toObject())
        return;
    }
    //in case no email sent, the system will get one from first RFID element
    if(req.body.email == undefined) {
        const copy: Copy.Copy = await queryAsk.getCopyByRFID(req.body.RFID[0])
        req.body.email = copy.Email_Proprietario
    }

    const ID_Libreria = await (await queryAsk.getLibreriaByEmail(req.body.email)).ID
    if(ID_Libreria == -1) {
        res.status(400).send(new proto.BasicMessage({message: "No library associated with passed email."}).toObject())
        return;
    }
    for(const RFID of req.body.RFID) {
        if(!await queryAsk.verifyRFIDExists(RFID)) {
            res.status(400).send(new proto.BasicMessage({message: "The RFID passed does not exists."}).toObject())
            return;
        }
        if(!await queryAsk.addCopyToBackpack(RFID, ID_Libreria)) {
            res.status(500).send(new proto.BasicMessage({message: "Something went wrong while adding the copy to backpack."}).toObject())
            return;
        }
    }
    res.status(200).send(new proto.BasicMessage({message: "RFIDs added successfully."}).toObject())
});

router.delete('/removeCopies', async (req: {body: proto.multipleRFID}, res) => {
    if(req.body.RFID.length == 0) {
        res.status(400).send(new proto.BasicMessage({message: "You need to remove at least 1 copy."}).toObject())
        return;
    }

    for(const RFID of req.body.RFID) {
        if(!await queryAsk.removeCopyfromBackpack(RFID)) {
            res.status(500).send(new proto.BasicMessage({message: "Something went wrong while adding the copy to backpack."}).toObject())
            return;
        }
    }
    res.status(200).send(new proto.BasicMessage({message: "RFIDs removed successfully."}).toObject())
});

router.delete('/clear', async (req: {body: proto.BasicMessage}, res) => {
    if(!await queryAsk.removeAllCopyfromBackpackByEmail(req.body.message)) {
        res.status(500).send(new proto.BasicMessage({message: "Something went wrong while removing the copies to backpack."}).toObject())
        return;
    }
    res.status(200).send(new proto.BasicMessage({message: "RFIDs removed successfully."}).toObject())
});

router.get('/getCopiesRFID', async (req: {body: proto.BasicMessage}, res) => {
    if(req.body.message == undefined) {
        res.status(400).send(new proto.BasicMessage({message: "You need to specify the email."}).toObject())
        return;
    }
    const resQ = await queryAsk.getBackpackRFIDsByEmail(req.body.message)
    if(resQ[0] == "-1") {
        res.status(500).send(new proto.BasicMessage({message: "Internal server error."}).toObject())
        return;
    }
    res.status(200).send(new proto.multipleRFID({RFID: resQ}).toObject())
});

router.get('/getBooksISBN', async (req: {body: proto.BasicMessage}, res) => {
    if(req.body.message == undefined) {
        res.status(400).send(new proto.BasicMessage({message: "You need to specify the email."}).toObject())
        return;
    }
    const resQ = await queryAsk.getBackpackISBNByEmail(req.body.message)
    if(resQ[0] == "-1") {
        res.status(500).send(new proto.BasicMessage({message: "Internal server error."}).toObject())
        return;
    }
    res.status(200).send(new proto.multipleRFID({RFID: resQ}).toObject())
});