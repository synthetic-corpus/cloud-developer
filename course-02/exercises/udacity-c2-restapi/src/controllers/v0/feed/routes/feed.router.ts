import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';

const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
    items.rows.map((item) => {
            if(item.url) {
                item.url = AWS.getGetSignedUrl(item.url);
            }
    });
    res.send(items);
});

//@TODO
//Add an endpoint to GET a specific resource by Primary Key
router.get('/:id', async(req: Request, res: Response) => {
    const item = await FeedItem.findByPk(req.params.id)
    if(item){
        res.status(200).send(item)
    }else{
        res.status(404).send(`nothing found with id ${req.params.id}`)
    }
})

// update a specific resource
router.patch('/:id', 
    requireAuth, 
    async (req: Request, res: Response) => {
        //@TODO try it yourself
       const toUpdate = await FeedItem.findByPk(req.params.id)
       if(toUpdate){
           try{
            toUpdate.update(req.body)
            toUpdate.save()
            res.status(202).send(toUpdate)
           }catch(e){
               res.status(401).send(`could not update with data. ${e}`)
           }
       }else{
        res.status(404).send(`nothing found with id ${req.params.id}`)
       }
});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', 
    requireAuth,
    async (req: Request, res: Response) => {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({url: url});
});

/* This will not return anything to the front end or to the user.
It will simply upload a filtered copy of an image to the same bucket as the
unfiltered images.

This minimal functionality done for the sake of brevity. */
/*
router.get('/filterImage/:id',
    async(req: Request, res: Response) => {
        const toFilter = await FeedItem.findByPk(req.params.id)
        const signedURL = AWS.getGetSignedUrl(toFilter.url)
        
        
    }
) */

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', 
    requireAuth, 
    async (req: Request, res: Response) => {
    const caption = req.body.caption;
    const fileName = req.body.url;

    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }

    const item = await new FeedItem({
            caption: caption,
            url: fileName
    });

    const saved_item = await item.save();

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;