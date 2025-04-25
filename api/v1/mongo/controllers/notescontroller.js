import {Notes} from "../../../../modules/Note.js";


//get all note
export const getAllNotes = async(req,res) => {
    
try {
    const note = await Notes.find().sort({createdAt: -1, isPinned: -1});
  res.status(200).json(note);
} catch (err) {
    res.status(500).json({
        error:true,
        message:"Failed to fetch all notes",
        details: err.message
    });
  
}
};
//Create anote
export const createNotes = async (req, res) => {
    const {title,content,tags = [],isPinned = false, userId } = req. body
    try {
        const note =await Notes.create({
            title,
            content,
            tags,
            isPinned,
            userId,
            
        })
        res.status(201).json(note)
    } catch (err) {
        res.status(500).json({
            error:true,
            message:"Failed to fetch all notes",
            details: err.message 
        });
    }
};
