import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Google OAuth Data
    googleId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    avatar: {
      type: String
    },

    // Onboarding Status
    onboarding: {
      isCompleted: {
        type: Boolean,
        default: false
      },
      currentStep: {
        type: Number,
        default: 1,
        min: 1,
        max: 4
      },
      completedAt: {
        type: Date
      }
    },

    // Step 1: Identity (Workspace Identity)
    identity: {
      workspaceName: {
        type: String,
        trim: true,
        maxlength: 100
      },
      industry: {
        type: String,
        enum: ['tech', 'finance', 'healthcare', 'education', 'manufacturing', 'retail', 'other']
      },
      companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
      }
    },

    // Step 2: Intelligence (Profile & Specializations)
    intelligence: {
      primaryRole: {
        type: String,
        enum: ['ai-developer', 'product-manager', 'data-scientist', 'ml-engineer', 'researcher', 'executive', 'other']
      },
      specializations: [{
        type: String,
        enum: ['nlp', 'computer-vision', 'predictive-analytics', 'edge-computing', 'reinforcement-learning', 'generative-ai', 'mLOps']
      }],
      experienceLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
      },
      useCases: [{
        type: String,
        maxlength: 200
      }]
    },

    // Step 3: Workspace (Environment & Preferences)
    workspace: {
      region: {
        type: String,
        enum: ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1'],
        default: 'us-east-1'
      },
      notifications: {
        emailDigest: {
          type: Boolean,
          default: true
        },
        slackIntegration: {
          type: Boolean,
          default: false
        },
        systemAlerts: {
          type: Boolean,
          default: true
        },
        marketingEmails: {
          type: Boolean,
          default: false
        }
      },
      timezone: {
        type: String,
        default: 'UTC'
      },
      language: {
        type: String,
        default: 'en'
      }
    },

    // Step 4: Configuration (Review & Metadata)
    configuration: {
      environmentName: {
        type: String,
        default: 'Synthetix-V4'
      },
      tier: {
        type: String,
        enum: ['free', 'starter', 'professional', 'enterprise'],
        default: 'free'
      },
      features: [{
        name: String,
        enabled: Boolean,
        configuredAt: Date
      }],
      provisioningStatus: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'failed'],
        default: 'pending'
      }
    },

    // System Fields
    lastLoginAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'onboarding.isCompleted': 1, 'onboarding.currentStep': 1 });

// Instance method to check and auto-complete onboarding
userSchema.methods.checkAndCompleteOnboarding = function() {
  const hasWorkspaceName = this.identity?.workspaceName;
  const hasPrimaryRole = this.intelligence?.primaryRole;
  const hasRegion = this.workspace?.region;
  
  if (hasWorkspaceName && hasPrimaryRole && hasRegion && !this.onboarding.isCompleted) {
    this.onboarding.isCompleted = true;
    this.onboarding.currentStep = 4;
    this.onboarding.completedAt = new Date();
    this.configuration.provisioningStatus = 'completed';
    return true;
  }
  return false;
};

// Instance method to get onboarding progress
userSchema.methods.getOnboardingProgress = function() {
  const steps = ['identity', 'intelligence', 'workspace', 'configuration'];
  const completedSteps = steps.filter(step => {
    const data = this[step];
    return data && Object.keys(data).length > 0 && 
           (Array.isArray(data) ? data.length > 0 : true);
  }).length;
  
  return {
    currentStep: this.onboarding.currentStep,
    totalSteps: 4,
    percentage: Math.round((this.onboarding.currentStep / 4) * 100),
    isCompleted: this.onboarding.isCompleted,
    nextStep: this.onboarding.isCompleted ? null : this.onboarding.currentStep
  };
};

// Static method to find by onboarding status
userSchema.statics.findByOnboardingStatus = function(isCompleted) {
  return this.find({ 'onboarding.isCompleted': isCompleted });
};

export default mongoose.model("User", userSchema);