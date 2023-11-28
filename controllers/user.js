const express = require("express");
const jwt = require("jsonwebtoken");
const validationResult = require("express-validator").validationResult;
const CustomErrorValidation = require("../lib/CustomError");
const User = require("../lib/User");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const comparePassword = require("../lib/passwordHash").comparePassword;
const dotenv = require('dotenv').config()
const FRONT = process.env.FRONTURL
/**
 * @param {express.Request} req
 * @param {express.Response} res
 */

async function register(req, res, next) {

  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    next(new CustomErrorValidation("Some errors", 500, validation.array()));
    return;
  }

  const { email, password, name } = req.body;
  /* constructor(email, password, name, role, updatedAt)  */
  /**
   * @type {User}
   */

  const hashedPassword = await User.createHashedPassword(password);
  const user = new User(email, hashedPassword, name)
  if(email === 'filippo@email.com'){
    user.role = 'admin'
  }

  const addedUser = await prisma.user.create({
    data: user
  })

  res.json({
    message: "User added",
    name: user.name,
    email: user.email,
    role: user.role
  });
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function login(req, res, next){
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      next(new CustomErrorValidation("Some errors", 500, validation.array()));
      return;
    }

    const { email, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        email: email
      }
    })
    if(!user){
      next(new CustomErrorValidation("Wrong credentials", 401));
      return;
    }

    const passwordMatch = await comparePassword(password, user.password)
    if(!passwordMatch){
      next(new CustomErrorValidation("Wrong credentials", 401));
      return;
    }
    const token = jwt.sign({
      id: user.id,
      role: user.role,
      email: user.email
    }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    })

    res.status(200).cookie('pl-token', token, {
        expires: new Date(Date.now() + 3600000)
    }).json({
        code: 200,
        message: "User logged in",
        name: user.name,
        email: user.email,
        role: user.role
    })
}

async function isLogged(req, res, next){
  const token = req.cookies['pl-token']
  if(!token){
    res.json({
      code: 401,
      message: "Not logged"
    })
    return;
  }
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if(!decoded){
      res.json({
        code: 401,
        message: "Not logged"
      })
      return;
    }
    const user = await prisma.user.findFirst({
      where: {
        email: decoded.email
      }
    })
    if(!user){
      res.json({
        code: 401,
        message: "Not logged"
      })
      return;
    }
    res.status(200).json({
      code: 200,
      message: "isValid",
     
    })
  }catch(err){
    res.json({
      code: 401,
      message: "Not logged"
    })
    return;
  }
}

module.exports = {
  register,
  login,
  isLogged
};
