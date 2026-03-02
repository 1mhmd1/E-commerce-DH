import multer from "multer";

const storage = multer.memoryStorage();
// memoryStorage() keeps the uploaded file in RAM as a Buffer (req.file.buffer)
// We do NOT save to disk — we stream directly to B2, which is faster and cleaner


//This method in general is used to make some consistancy checks 
//for the loaded file props
const upload = multer ({
    storage, 
    limits:{
        fileSize: 5 * 1024 * 1024
    },
    //only allowing pdfs
    fileFilter(req, file, callback) {
        if(file.mimetype === "application/pdf"){
            callback(null, true);
        }else{
            callback(new Error("Only PDF files are allowed for CVs"));
        }
    },
});

export default upload; 