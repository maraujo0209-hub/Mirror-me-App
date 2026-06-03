import { Schema, model, Document } from 'mongoose';

// ============================================================================
// 1. AVATAR CONFIGURATION SCHEMA INTERFACES
// ============================================================================
export interface IAvatarDocument extends Document {
  userId: string; // References the Primary User Record in PostgreSQL
  name: string;
  status: 'processing' | 'trained' | 'failed';
  voiceEngine: {
    provider: 'elevenlabs' | 'openai';
    voiceId: string;
    stability: number;
    clarity: number;
  };
  visualModel: {
    provider: 'did' | 'custom-pipeline';
    sourceVideoUrl?: string;
    generatedAvatarId?: string;
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AvatarSchema = new Schema<IAvatarDocument>(
  {
    userId: { type: String, required: true, index: true }, // Indexed for fast user lookup queries
    name: { type: String, required: true, trim: true },
    status: { 
      type: String, 
      enum: ['processing', 'trained', 'failed'], 
      default: 'processing' 
    },
    voiceEngine: {
      provider: { type: String, enum: ['elevenlabs', 'openai'], required: true },
      voiceId: { type: String, required: true },
      stability: { type: Number, default: 0.75 },
      clarity: { type: Number, default: 0.75 }
    },
    visualModel: {
      provider: { type: String, enum: ['did', 'custom-pipeline'], required: true },
      sourceVideoUrl: { type: String },
      generatedAvatarId: { type: String }
    },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt values
);

// ============================================================================
// 2. MEETING ANALYTICS & CHAT MEMORY SCHEMA INTERFACES
// ============================================================================
export interface IMeetingAnalysisDocument extends Document {
  meetingId: string; // References the scheduling record inside PostgreSQL
  hostId: string;
  rawTranscript: {
    speaker: string;
    text: string;
    timestamp: number;
  }[];
  aiSummary: {
    overview: string;
    keyTakeaways: string[];
    actionItems: {
      assignee: string;
      task: string;
      deadline?: string;
    }[];
    sentimentScore: number; // Quantitative metrics (-1.0 completely negative to +1.0 positive)
  };
  tokensConsumed: {
    prompt: number;
    completion: number;
    total: number;
  };
}

const MeetingAnalysisSchema = new Schema<IMeetingAnalysisDocument>(
  {
    meetingId: { type: String, required: true, unique: true, index: true },
    hostId: { type: String, required: true, index: true },
    rawTranscript: [
      {
        speaker: { type: String, required: true },
        text: { type: String, required: true },
        timestamp: { type: Number, required: true }
      }
    ],
    aiSummary: {
      overview: { type: String, required: true },
      keyTakeaways: [{ type: String }],
      actionItems: [
        {
          assignee: { type: String, required: true },
          task: { type: String, required: true },
          deadline: { type: String }
        }
      ],
      sentimentScore: { type: Number, default: 0.0 }
    },
    tokensConsumed: {
      prompt: { type: Number, default: 0 },
      completion: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// ============================================================================
// 3. COMPILED MONGOOSE DATABASE MODELS EXPORTS
// ============================================================================
export const AvatarModel = model<IAvatarDocument>('Avatar', AvatarSchema);
export const MeetingAnalysisModel = model<IMeetingAnalysisDocument>('MeetingAnalysis', MeetingAnalysisSchema);
