import { User } from "../models/user-model";


export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(".password")
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message:"User not found"
            })
        }

        res.status(200), json({
           
        })

    } catch (error) {
        
    }
}