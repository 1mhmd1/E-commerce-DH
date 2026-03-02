import Router from "express";
import {getAllSkills, AddSkillByUser, deleteSkillByUser, getUserSkills, findSkill, addSkillGlobaly, deleteSkillGlobaly} from "../controllers/user.skills.controllers";
import {authenticateToken} from "../middlewares/auth.middleware";

const userSkillsRouter  = Router();

userSkillsRouter.get('/getAllSkills', getAllSkills);
userSkillsRouter.put('/addSkillByUser', authenticateToken, AddSkillByUser);
userSkillsRouter.delete('/deleteUserSkills', authenticateToken, deleteSkillByUser);
userSkillsRouter.get('/getUserSkills', authenticateToken, getUserSkills);
userSkillsRouter.get("/findSkill", authenticateToken, findSkill);

//For the Admin
userSkillsRouter.post("/addSkillGlobaly", authenticateToken, addSkillGlobaly);
userSkillsRouter.delete("/deleteSkillGlobaly", authenticateToken, deleteSkillGlobaly);




export default userSkillsRouter;