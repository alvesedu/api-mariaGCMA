import mongoose from 'mongoose';

const AuthorQuestionnaireSchema = new mongoose.Schema({
  // Pergunta 1: Presença do autor
  authorPresence: {
    type: String,
    enum: ['PRESENTE', 'AUSENTE', 'ENDEREÇO NÃO LOCALIZADO', 'MUDANÇA DE ENDEREÇO', 'Outro'],
    required: true,
  },
  otherAuthorPresence: {
    type: String,
    required: function() { return this.authorPresence === 'Outro'; },
  },
  // Pergunta 2: Tipo de atendimento
  attendanceType: {
    type: String,
    enum: ['PRESENCIAL NA RESIDÊNCIA', 'PRESENCIAL NO LOCAL DE TRABALHO', 'PRESENCIAL EM LOCAL NEUTRO', 'POR TELEFONE', 'ATENDIMENTO NÃO REALIZADO EM VIRTUDE DE NÃO LOCALIZAÇÃO DO AUTOR', 'Outro'],
    required: true,
  },
  otherAttendanceType: {
    type: String,
    required: function() { return this.attendanceType === 'Outro'; },
  },
  // Pergunta 3: Unidade que realizou a visita
  visitingUnit: {
    type: String,
    enum: ['GUARDA MUNICIPAL DE ANANINDEUA', '6º BPM', '29º BPM', '30º BPM', 'Outro'],
    required: true,
}
,
  // Pergunta x: Vara familiar
  varaFamily: {
    type: String,
    enum: ['4ª VVDF - ANANINDEUA'],
    required: true,
  },
   // Pergunta xx: Numero do processo
   numberProcess: {
    type: String,
    required: true,
  },
  // Pergunta 4: Nome do autor
  authorName: {
    type: String,
    required: true,
  },
  // Pergunta 5: Nome da vítima
  victimName: {
    type: String,
    required: true,
  },
  // Pergunta 6: Data de nascimento do autor
  authorBirthDate: {
    type: Date,
    required: true,
  },
  // Pergunta 7: RG do autor
  authorRG: {
    type: String,
    required: true,
  },
  // Pergunta 8: CPF do autor
  authorCPF: {
    type: String,
    required: true,
  },
  // Pergunta 9: Endereço do autor
  authorAddress: {
    type: String,
    required: true,
  },
  // Pergunta 10: Bairro do autor
  authorNeighborhood: {
    type: String,
    required: true,
  },
  // Pergunta 11: Município do autor
  authorMunicipality: {
    type: String,
    enum: ['BELÉM', 'ANANINDEUA', 'Outro'],
    required: true,
  },
  otherMunicipality: {
    type: String,
    required: function() { return this.authorMunicipality === 'Outro'; },
  },
  // Pergunta 12: Data da visita
  visitDate: {
    type: Date,
    required: true,
  },
  // Pergunta 13: Horário da visita
  visitTime: {
    type: String,
    required: true,
  },
  // Pergunta 14: Sexo do autor
  authorGender: {
    type: String,
    enum: ['FEMININO', 'MASCULINO'],
    required: true,
  },
  // Pergunta 15: Etnia/Cor do autor
  authorEthnicity: {
    type: String,
    enum: ['BRANCA', 'NEGRA', 'PARDA', 'ORIENTAL', 'INDÍGENA'],
    required: true,
  },
  // Pergunta 16: Grau de escolaridade do autor
  authorEducationLevel: {
    type: String,
    enum: ['ENSINO FUNDAMENTAL INCOMPLETO', 'ENSINO FUNDAMENTAL COMPLETO', 'ENSINO MÉDIO INCOMPLETO', 'ENSINO MÉDIO COMPLETO', 'ENSINO SUPERIOR INCOMPLETO', 'ENSINO SUPERIOR COMPLETO'],
    required: true,
  },
  // Pergunta 17: Estado civil do autor
  authorMaritalStatus: {
    type: String,
    enum: ['CASADO(A)', 'UNIÃO ESTÁVEL', 'SOLTEIRO(A)', 'DIVORCIADO(A)', 'VIÚVO(A)', 'Outro'],
    required: true,
  },
  // Pergunta 18: O autor trabalha?
  authorEmployed: {
    type: Boolean,
    required: true,
  },
  // Pergunta 19: Renda familiar do autor
  authorIncome: {
    type: String,
    enum: ['UM SALÁRIO', 'MENOS DE UM SALÁRIO', 'MAIS DE UM SALÁRIO', 'NÃO DECLAROU'],
    required: true,
  },
  // Pergunta 20: O autor possui filhos com a vítima?
  hasChildrenWithVictim: {
    type: Boolean,
    required: true,
  },
  // Pergunta 21: Quantos filhos o autor possui com a vítima?
  numberOfChildrenWithVictim: {
    type: Number,
    required: function() { return this.hasChildrenWithVictim === true; },
  },
  // Pergunta 22: O autor consome álcool/drogas?
  substanceUse: {
    type: Boolean,
    required: true,
  },
  // Pergunta 23: Se sim, qual substância?
  substanceDetails: {
    type: String,
    required: function() { return this.substanceUse === true; },
  },
  // Pergunta 24: Grau de parentesco com a vítima
  relationshipWithVictim: {
    type: String,
    enum: ['ESPOSA', 'EX CÔNJUGE', 'NAMORADA', 'FILHA', 'IRMÃ', 'MADRASTA', 'MÃE', 'EX NAMORADA', 'Outro'],
    required: true,
  },
  // Pergunta 25: As medidas protetivas estão sendo cumpridas?
  protectiveMeasuresComplied: {
    type: Boolean,
    required: true,
  },
  // Pergunta 26: Se não, de que forma estão sendo descumpridas?
  nonComplianceDetails: {
    type: String,
    required: function() { return this.protectiveMeasuresComplied === false; },
  },
  // Pergunta 27: Data do último contato com a vítima
  lastContactDate: {
    type: Date,
    required: true,
  },
  // Pergunta 28: Frequência do contato com a vítima
  contactFrequency: {
    type: String,
    enum: ['DIARIAMENTE', 'SEMANALMENTE', 'MENSALMENTE', 'OCASIONALMENTE'],
    required: true,
  },
  // Pergunta 29: O autor possui antecedentes criminais?
  hasCriminalRecord: {
    type: Boolean,
    required: true,
  },
  // Pergunta 30: O autor já foi preso?
  hasBeenArrested: {
    type: Boolean,
    required: true,
  },
  // Pergunta 31: O autor faz ou já fez uso de álcool?
  alcoholUse: {
    type: Boolean,
    required: true,
  },
  // Pergunta 32: Se sim, com que frequência?
  alcoholUseFrequency: {
    type: String,
    enum: ['DIARIAMENTE', 'SEMANALMENTE', 'MENSALMENTE', 'OCASIONALMENTE', 'NÃO USA'],
    required: function() { return this.alcoholUse === true; },
  },
  // Pergunta 33: O autor faz uso de drogas?
  drugUse: {
    type: Boolean,
    required: true,
  },
  // Pergunta 34: Se sim, qual o tipo de droga?
  drugDetails: {
    type: String,
    required: function() { return this.drugUse === true; },
  },
  // Pergunta 35: Se sim, com que frequência usa drogas?
  drugUseFrequency: {
    type: String,
    enum: ['DIARIAMENTE', 'SEMANALMENTE', 'MENSALMENTE', 'OCASIONALMENTE'],
    required: function() { return this.drugUse === true; },
  },
  // Pergunta 36: O autor se submeteu a tratamento para dependência química?
  chemicalDependencyTreatment: {
    type: Boolean,
    required: true,
  },
  // Pergunta 37: O autor possui transtornos mentais comprovados ou suspeitos?
  mentalDisorders: {
    type: Boolean,
    required: true,
  },
  // Pergunta 38: O autor foi devidamente notificado sobre as medidas protetivas?
  notifiedAboutProtectiveMeasures: {
    type: Boolean,
    required: true,
  },
  // Pergunta 39: O autor concorda com o teor do questionário?
  agreesWithQuestionnaire: {
    type: Boolean,
    required: true,
  },
   // Pergunta 40: O autor ou familiares residem próximo da vítima?
   residesNearVictim: {
    type: Boolean,
    required: true,
  },
  // Pergunta 41: Data aproximada do último contato com a vítima
  lastContactWithVictimDate: {
    type: Date,
    required: true,
  },
  // Pergunta 42: O autor concorda com o inteiro teor da descrição no presente questionário?
  agreesWithQuestionnaire: {
    type: Boolean,
    required: true,
  },
  // Pergunta 43: O autor faz uso de drogas?
  drugUse: {
    type: Boolean,
    required: true,
  },
  // Pergunta 44: Caso faça uso de drogas, qual o tipo?
  drugDetails: {
    type: String,
    required: function() { return this.drugUse === true; },
  },
  // Pergunta 45: Caso faça uso de drogas, qual a frequência?
  drugUseFrequency: {
    type: String,
    enum: ['DIARIAMENTE', 'SEMANALMENTE', 'MENSALMENTE', 'OCASIONALMENTE'],
    required: function() { return this.drugUse === true; },
  },
  // Pergunta 46: Caso faça uso de drogas, submeteu-se a algum tratamento para dependência química?
  chemicalDependencyTreatment: {
    type: Boolean,
    required: function() { return this.drugUse === true; },
  },
  // Pergunta 47: O autor possui transtornos mentais comprovados ou suspeitos?
  mentalDisorders: {
    type: Boolean,
    required: true,
  },
  // Pergunta 48: O autor já foi devidamente notificado das medidas protetivas pelo poder judiciário?
  notifiedAboutProtectiveMeasures: {
    type: Boolean,
    required: true,
  },
  // Pergunta 49: Caso o autor tenha conhecimento das medidas protetivas, ele está cumprindo inteiramente?
  complyingWithProtectiveMeasures: {
    type: Boolean,
    required: function() { return this.notifiedAboutProtectiveMeasures === true; },
  },
  // Pergunta 50: Data aproximada do último contato com a vítima
  lastContactDate: {
    type: Date,
    required: true,
  },
  // Pergunta 51: O autor ou familiares residem próximo à vítima?
  authorOrFamilyNearVictim: {
    type: Boolean,
    required: true,
  },
  // Pergunta 52: Observações gerais
  generalObservations: {
    type: String,
  },
},
  {
    timestamps: {
      createdAt: 'created_at', // nome do campo para a data de criação
      updatedAt: 'updated_at'  // nome do campo para a data de atualização
    }

});

module.exports = mongoose.model('AuthorQuestionnaire', AuthorQuestionnaireSchema);
