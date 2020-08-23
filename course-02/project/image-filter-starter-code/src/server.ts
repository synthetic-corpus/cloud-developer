import { Request, Response } from 'express';
import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, validateImageURL, parseUrl} from './util/util';
import { filter } from 'bluebird';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  // @ts-ignore
  app.get("/filteredimage", async(req: Request, res: Response)=>{
    // AWS signed URLs must be extracted as raw Strings.
    // Otherwise, Node Turns them into an object that Jimp.read can't use.
    // @ts-ignore
    const extractedUrl = parseUrl((req._parsedUrl.query))
    if(validateImageURL(extractedUrl)){
      await filterImageFromURL(extractedUrl).then(
        (data)=>{
          res.status(201).sendFile(data, (error)=>{
            if(error){
              throw "error"
            }else{
              deleteLocalFiles([data])
            }
          })
        },
        (error)=>{
          throw "error"
        }
      ).catch((error)=>{
        res.send(500).send("Still Borken")
      })
      
    }else{
      res.status(400).send(req.query)
    }
  })


  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();