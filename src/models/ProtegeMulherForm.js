import mongoose from 'mongoose';

const ProtegeMulherFormSchema = new mongoose.Schema({
  name: String,
  age: Number,
  address: String,
  neighborhood: String,
  city: String,
  phone: String,
  hasChildren: Boolean,
  childrenInfo: String,

  // Relacionamento
  relationshipWithAggressor: String,
  livedTogether: Boolean,
  stillContact: Boolean,

  // Tipos de violência
  violenceTypes: [String], // ['Física', 'Psicológica', etc.]
  violenceFrequency: String,

  // Rede de apoio
  toldSomeone: [String], // ['Família', 'Amigas(os)', ...]
  soughtHelp: [String],  // ['Polícia', 'CREAS', ...]
  receivedProtectiveMeasure: String, // 'Sim', 'Não', 'Não sei'

  // Situação financeira
  hasOwnIncome: Boolean,
  incomeSources: [String],
  incomeRange: String,
  financiallyDependent: String, // 'Sim', 'Parcialmente', 'Não'
  preventedFromWorking: Boolean,

  // Expectativas
  needs: [String],
  futurePerspective: String
}, {
  timestamps: true
});

export default mongoose.model('ProtegeMulherForm', ProtegeMulherFormSchema);
