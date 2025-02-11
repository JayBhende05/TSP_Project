import {comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import JWT from 'jsonwebtoken'

//RGISTER
export const registerController = async (req, res) => {
    try {
        const {name,email,password,phone,address,answer} = req.body
        //validation
        if(!name){
            return res.send({message :'Name is Required'})
        }
        if(!email){
            return res.send({message :'Email is Required'})
        }
        if(!password){
            return res.send({message :'Password is Required'})
        }
        if(!phone){
            return res.send({message :'Phone is Required'})
        }
        if(!address){
            return res.send({message :'Address is Required'})
        }
        if(!answer){
            return res.send({message :'Answer is Required'})
        }
        //check user
        const existingUser = await userModel.findOne({email})
        //existing user
        if(existingUser){
            return res.status(200).send({
                success:false,
                message:'Already Register please Login',
            })
            
        }
        //register user
        const hashedPasssword = await hashPassword(password)
        //save on database
        const user = await new  userModel({name,email,phone,address,password:hashedPasssword,answer}).save();

       
       res.status(201).send({
        success: true,
        message: "User Register Successfully",
        user,
       });
    
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error in Registration",
            error
        })
    }
};

//LOGIN
export const loginController = async (req, res)=>{
  try {
    const {email,password} = req.body
    //validate
    if(!email || ! password){
        return res.status(404).send({
            success:false,
            message:"Invalid Credentials"
        })
    }
 //check user
 const user = await userModel.findOne({email})
 if(!user){
    return res.status(404).send({
        success:false,
        message:"Register your Email"
    })
    
 }
  //compare password 
    const match = await comparePassword(password, user.password)
    if(!match){
        return res.status(200).send({
            success:false,
            message:"Login with Correct Credentials"

        })
    }


    //creating token
    const token = await JWT.sign({_id:user._id},process.env.JWT_SECRET, {expiresIn: "7d"});
    res.status(200).send({
        success:true,
        message:"Login Succesfully",
        user:{
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
        },

        token,
    });
  } catch (error) {
    console.log(error)
    res.status(500).send({
        success:false,
        message:"Error in Login",
        error

    })
  }

} 

//forgot-password
export const forgotPasswordController = async (req,res) =>{
    try {
        const{email,answer,newPassword} = req.body
        if(!email){
            res.status(400).send({message: "Email is Required"});
        }
        if(!answer){
            res.status(400).send({message: " Required"});
        }
        if(!newPassword){
            res.status(400).send({message: " Required"});
        }
        //check
        const user = await userModel.findOne({email,answer})
        //validation
        if(!user){
            return res.status(404).send({
                success:false,
                message:"Crendential Invalid"
            })
        }
        const hashed = await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id,{password: hashed});
        res.status(200).send({
            success:true,
            message:"Password Reset Succesfully",
            
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Something went Wrong",
            error
        })
    }
};

//test controller
export const testController = (req, res) => {
    try {
      res.send("Protected Routes");
    } catch (error) {
      console.log(error);
      res.send({ error });
    }
  };

  //orders
export const getOrdersController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({ buyer: req.user._id })
        .populate("products", "-photo")
        .populate("buyer", "name");
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error WHile Geting Orders",
        error,
      });
    }
  };
  //orders
  export const getAllOrdersController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({})
        .populate("products", "-photo")
        .populate("buyer", "name")
        .sort({ createdAt: "-1" });
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error WHile Geting Orders",
        error,
      });
    }
  };
  
  //order status
  export const orderStatusController = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const orders = await orderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error While Updateing Order",
        error,
      });
    }
  };
