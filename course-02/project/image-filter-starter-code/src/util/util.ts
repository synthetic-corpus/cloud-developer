import fs from 'fs';
import Jimp = require('jimp');
import Https = require('https')




// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string>{
    return new Promise( async resolve => {
        const photo = await Jimp.read(inputURL);
        const outpath = '/tmp/filtered.'+Math.floor(Math.random() * 2000)+'.jpg';
        await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(__dirname+outpath, (img)=>{
            resolve(__dirname+outpath);
        });
    });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files:Array<string>){
    for( let file of files) {
        fs.unlinkSync(file);
    }
}

function urlExists(address: string): boolean {
    return true
}
/* validate a URL */
export async function validateImageURL(address: string): boolean{
    /*
    // Is it even written correctly?
    try{
        const newAddress = new URL(address)
    }catch(TypeError){
        return false
    }
    // Is it written like we'd expect an image?
    return address.toLowerCase().match(/(.jpeg|.jpg|.gif|.png)/) != null
    */
   
    //if it looks like it would have an image, validate the URL
    if(address.toLowerCase().match(/(.jpeg|.jpg|.gif|.png)/) != null) {
        const value = urlExists(address)//returns false on a 4xx error
        console.log("**** Got the Returned value of ",value)
        return value
    }else{
        return false
    }
}

/* Extracts the Query string and turns it into a URL that can be input into jimp */
export function parseUrl(query: string): string{
    const queriedUrl = query.replace("image_url=",'')
    console.log("**** I have a string like... ",queriedUrl)
    return queriedUrl
}