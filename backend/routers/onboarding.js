import express from "express";
import { completeOnboarding, getOnboardingStatus, saveOnboardingStep } from "../controller/onboarding.js";
import { isAuthenticated } from "../auth/auth.js";


const onboardingRoutes = express.Router();



onboardingRoutes.get("/status",isAuthenticated, getOnboardingStatus);
onboardingRoutes.post("/step/:stepNumber",isAuthenticated, saveOnboardingStep);
onboardingRoutes.post("/complete",isAuthenticated,  completeOnboarding)
// onboardingRoutes.get()
export default onboardingRoutes;


 