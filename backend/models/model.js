// models/Model.js
import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Model name is required'],
      trim: true,
      maxlength: 100
    },
    version: {
      type: String,
      required: true,
      trim: true,
      match: [/^v?\d+\.\d+\.\d+(-beta|-alpha)?$/, 'Invalid version format']
    },
    description: {
      type: String,
      required: true,
      maxlength: 500
    },
    category: {
      type: String,
      enum: ['Computer Vision', 'NLP', 'Predictive Analytics', 'Generative AI'],
      required: true
    },
    source: {
      type: String,
      enum: ['Proprietary', 'Marketplace'],
      default: 'Proprietary'
    },
    status: {
      type: String,
      enum: ['Ready', 'Training', 'Idle', 'Archived'],
      default: 'Idle'
    },
    image: {
      type: String,
      default: 'default-model.jpg'
    },
    tags: [String],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    configuration: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    deploymentCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastDeployed: Date
  },
  {
    timestamps: true  // adds createdAt and updatedAt automatically
  }
);

// Ensure name + version is unique per owner
modelSchema.index({ name: 1, version: 1, owner: 1 }, { unique: true });

const Model = mongoose.model('Model', modelSchema);
export default Model;