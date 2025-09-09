// src/models/ProMulherQuestionnaire.js
import mongoose from 'mongoose';

const ProMulherSchema = new mongoose.Schema({
  cardNumber: { type: String },
  month: { type: String },
  team: { type: String },
  visitNumber: { type: Number },
  occurrenceLocation: { type: String },
  customOccurrenceLocation: { type: String },
  occurrenceDate: { type: Date },
  occurrenceInterval: { type: String },
  victimName: { type: String },
  victimAge: { type: Number },
  victimSkinColor: { type: String },
  aggressorName: { type: String },
  aggressorAge: { type: Number },
  aggressorRelationship: { type: String },
  report: { type: String },
  riskLevel: { type: String },
  address: { type: String },
  neighborhood: { type: String },
  conclusion: { type: String },
  referredToSocial: { type: Boolean },
  socialAgency: { type: String },
}, { timestamps: true });

export default mongoose.model("ProMulherQuestionnaire", ProMulherSchema);
