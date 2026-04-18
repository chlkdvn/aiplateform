import User from "../models/User.js";

// Get current onboarding status
export const getOnboardingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      onboarding: user.onboarding,
      progress: user.getOnboardingProgress(),
      data: {
        identity: user.identity,
        intelligence: user.intelligence,
        workspace: user.workspace,
        configuration: user.configuration
      }
    });
  } catch (error) {
    console.error("Get onboarding status error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Save step data (Step 1: Identity, Step 2: Intelligence, Step 3: Workspace, Step 4: Review)
export const saveOnboardingStep = async (req, res) => {
  try {
    const stepNumber = parseInt(req.params.stepNumber);
    const { data } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    switch(stepNumber) {
      case 1:
        // Use || {} to prevent undefined spread errors
        user.identity = { ...(user.identity || {}), ...data };
        break;
      case 2:
        user.intelligence = { ...(user.intelligence || {}), ...data };
        break;
      case 3:
        user.workspace = { ...(user.workspace || {}), ...data };
        break;
      case 4:
        user.configuration = { ...(user.configuration || {}), ...data };
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid step number' });
    }
    
    if (stepNumber > user.onboarding.currentStep) {
      user.onboarding.currentStep = stepNumber;
    }
    
    // Check if onboarding should be auto-completed
    user.checkAndCompleteOnboarding();
    
    await user.save();
    
    res.json({
      success: true,
      message: `Step ${stepNumber} saved`,
      nextStep: stepNumber < 4 ? stepNumber + 1 : null,
      isComplete: user.onboarding.isCompleted
    });
  } catch (error) {
    console.error("Save onboarding step error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Complete onboarding manually
export const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    user.onboarding.isCompleted = true;
    user.onboarding.currentStep = 4;
    user.onboarding.completedAt = new Date();
    user.configuration.provisioningStatus = 'completed';
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Onboarding completed',
      redirectUrl: '/dashboard.html'
    });
  } catch (error) {
    console.error("Complete onboarding error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Skip onboarding
export const skipOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    user.onboarding.isCompleted = true;
    user.onboarding.skipped = true;
    user.onboarding.completedAt = new Date();
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Onboarding skipped',
      redirectUrl: '/dashboard.html'
    });
  } catch (error) {
    console.error("Skip onboarding error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};