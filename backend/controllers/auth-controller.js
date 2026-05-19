import { User } from "../models/user-model.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs"
import { sendForgotPassword, sendVerification } from "../utils/emailServices.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, } = req.body;

    if (!name || !email || !password || !role ) {
      return res.status(400).json({
        success: false,
        message: "Something is missing",
      });
    }

    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(400).json({
        success: false,
        message: "user already exist",
      });
    }

      const hashPassword = await bcrypt.hash(password, 10);
      
      const userRole = role || "user"
      
      const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationOTPExpires = Date.now() + 10 * 60 * 1000//
      
      const user = await User.create({
          name,
          email,
          password:hashPassword,
          role,
          verificationOTP,
          verificationOTPExpires
      })

      //to send verification email
      try {
        await sendVerification(email,name,verificationOTP)
      } catch (error) {
        console.log(error);
        
      }

      

    

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not create",
      });
      }
      
      return res.status(201).json({
          success: true,
          message: 'Account created successfully',
          user: {
              name: user.name,
              email: user.email,
              role: user.role,
              isVerified:false
          }
      })

  } catch (error) {
      console.log("hii",error);
      
      res.status(500).json({
          success: false,
          message:error.message
      })
  }
};


export const login = async(req, res) => {
    try {
        
        const { email, password, role } = req.body
        
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message:'something is missing'
            })
        }
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message:"email or password  incorrect"
            })
        }

        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message:"please verify before logging"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message:"incorrect email or password"
            })
        }

        //check role is correct or not
        // if (role !== user.role) {
        //     return res.status(400).json({
        //         success: false,
        //         message:'Account does not exist in current role'
        //     })
        // }

        const tokenData={
            userId:user._id
        }

        const token = await jwt.sign(tokenData, process.env.JWT_KEY, { expiresIn: '1d' })
        
        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile:user.profile
        }


        return res.status(200).json({
            message: `welcome back ${user.name} `,
            success: true,
            user,
            token
        })
        
        


    } catch (error) {
        
        console.log(error);
        
    }
}

//to verify the email
export const verifyEmail = async (req, res) => {
     try {
         const { email, otp } = req.body
         if (!email || !otp) {
             return res.status(400).json({
                 success: false,
                 message:'Email and otp are required'
             })
         }

         const user = await User.findOne({
             email,
             verificationOTP: otp,
             verificationOTPExpires:{$gt:Date.now()}
         })

         if (!user) {
             return res.status(400).json({
                 success: false,
                 message: 'Invalid or Expired Otp'
             });

             
         }

         user.isVerified = true;
             user.verificationOTP = undefined
             user.verificationOTPExpires = undefined
             
             await user.save()

             res.status(200).json({
                 success: true,
                 message:'Email verified successfully you can now log in'
             })

     } catch (error) {
         res.status(500).json({
             success: false,
             message:error.message
        })
     }
}
 

export const forgotPassword = async (req, res) => {
    try {
        
     const { email } = req.body
        
    if (!email) {
        return res.status(400).json({
            success: false,
            message:'User with this email not found'
        })
        }
        
        const user = await User.findOne({ email })
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message:"User with this email not found"
            })
        }

        const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const resetOTPExpires = Date.now() + 10 * 60 * 1000
        
        user.resetPasswordOTP = resetOTP
        user.resetPasswordOTPExpires = resetOTPExpires
        
        await user.save()

        try {
            await sendForgotPassword(email,user.name,resetOTP)
        } catch (error) {
            console.log('Failed to send reset email',error);
            
        }

        res.status(200).json({
            success: true,
            message:"Password reset OTP sent to your email"
        })


    } catch (error) {
        
           res.status(500).json({
             success: false,
             message:error.message
        })

    }
   


}

export const resetPassword = async (req, res) => {
    try {
        
        const { email, otp, newPassword } = req.body
        
        if (!email || !otp||!newPassword) {
            return res.status(400).json({
                success: false,
                message:'please provide email,otp and password'
            })
        }

        const user = await User.findOne({ email, resetPasswordOTP:otp, resetPasswordOTPExpires: { $gt: Date.now() } })
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message:'Invalid email'
            })
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        user.resetPasswordOTP = undefined
        user.resetPasswordOTPExpires = undefined
        
        await user.save()

        register.status(200).json({
            success: true,
            message:'Password reset successful you can now log in with your new password'
        })

    } catch (error) {
          res.status(500).json({
             success: false,
             message:error.message
        })
    }
}