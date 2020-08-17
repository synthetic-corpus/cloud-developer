import fs from 'fs';
import Jimp = require('jimp');
import Http = require('https')

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

/* validate a URL */
export function validateImageURL(address: string): boolean{
    // Is it even written correctly?
    try{
        const newAddress = new URL(address)
    }catch(TypeError){
        return false
    }
    // Is it written like we'd expect an image?
    return true //address.toLowerCase().match(/(.jpeg|.jpg|.gif|.png)$/) != null
}

/* Get image from URL and Save it Locally to Temp */
export async function getURLImage(address: string): Promise<any> {
    const fileName = '/tmp/filtered.'+Math.floor(Math.random() * 2000)+'.jpg'
    const file = fs.createWriteStream(fileName)
    return Http.get(address, (response) =>{
        response.pipe(file)
        return fileName
    })
    
}