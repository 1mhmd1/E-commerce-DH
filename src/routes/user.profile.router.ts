import { Router } from "express";
import {getStudentOwnProfileData, updateStudentProfile, uploadCV, getCV, deleteCV, getInstructorOwnProfileData, updateInstructorProfile} from "../controllers/user.profile.controllers";
import {authenticateToken, authorizeRoles} from "../middlewares/auth.middleware";

import upload from "../middlewares/multer.middleware";


const StudentProfileRouter = Router();
StudentProfileRouter.get('/my-profile', authenticateToken, authorizeRoles("student"), getStudentOwnProfileData);
StudentProfileRouter.patch('/update-profile', authenticateToken, authorizeRoles("student"), updateStudentProfile);
StudentProfileRouter.patch('/me/cv', authenticateToken, authorizeRoles("student"), upload.single("cv"), uploadCV);
StudentProfileRouter.get("/me/cv", authenticateToken, authorizeRoles("student"), getCV);
StudentProfileRouter.delete('/me/cv', authenticateToken, authorizeRoles('student'), deleteCV);



const InstructorProfileRouter = Router();
InstructorProfileRouter.get('/my-profile', authenticateToken, authorizeRoles("instructor"), getInstructorOwnProfileData);
InstructorProfileRouter.patch('/my-profile', authenticateToken, authorizeRoles("instructor"), updateInstructorProfile);

export { StudentProfileRouter, InstructorProfileRouter};