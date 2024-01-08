import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/users.controller.js";
const router = Router();
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
router.route('/register').post(upload.fields([
  {
    name:"avatar",
    maxCount:1
  },
  { 
    name:"coverImage",
    maxCount:1
  }
]),registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJwt,logoutUser)


export { router };