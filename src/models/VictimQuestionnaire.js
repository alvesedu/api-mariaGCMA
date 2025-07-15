// models/VictimQuestionnaire.js
import mongoose from 'mongoose';

const VictimQuestionnaireSchema = new mongoose.Schema(
  {
    /* ------------------------------------------------------------------
     * VISITA
     * ------------------------------------------------------------------ */
    victimPresence: {
      type: String,
      enum: [
        'PRESENTE',
        'AUSENTE',
        'ENDEREÇO NÃO LOCALIZADO',
        'MUDANÇA DE ENDEREÇO',
        'Outro',
      ],
      required: true,
    },
    otherVictimPresence: {
      type: String,
      required() {
        return this.victimPresence === 'Outro';
      },
    },

    attendanceType: {
      type: String,
      enum: [
        'PRESENCIAL',
        'PRESENCIAL NA RESIDÊNCIA',
        'PRESENCIAL NO LOCAL DE TRABALHO',
        'POR TELEFONE',
        'NÃO REALIZADA EM VIRTUDE DE AUSÊNCIA DA VÍTIMA',
        'Outro',
      ],
      required: true,
    },
    otherAttendanceType: {
      type: String,
      required() {
        return this.attendanceType === 'Outro';
      },
    },

    newAddress: {
      type: String,
      required() {
        return this.victimPresence === 'MUDANÇA DE ENDEREÇO';
      },
    },

    neighborhood: String,

    municipality: {
      type: String,
      enum: ['BELÉM', 'ANANINDEUA', 'Outro'],
      required: true,
    },
    otherMunicipality: {
      type: String,
      required() {
        return this.municipality === 'Outro';
      },
    },

    visitingUnit: {
      type: String,
      enum: [
        'GUARDA MUNICIPAL DE ANANINDEUA',
        '6º BPM',
        '29º BPM',
        '30º BPM',
        'Outro',
      ],
    },

    visitDate: { type: Date, required: true },
    visitTime: { type: String, required: true },

    /* ------------------------------------------------------------------
     * DADOS PESSOAIS
     * ------------------------------------------------------------------ */
    victimName: { type: String, required: true },
    birthDate: { type: Date, required: true },
    rg: String,
    cpf: String,

    maritalStatus: {
      type: String,
      enum: [
        'CASADO(A)',
        'UNIÃO ESTÁVEL',
        'SOLTEIRO(A)',
        'DIVORCIADO(A)',
        'VIÚVO(A)',
        'Outro',
      ],
    },

    housingCondition: {
      type: String,
      enum: ['ALUGADA', 'CEDIDA', 'PRÓPRIA', 'PRÓPRIA DE TERCEIROS', 'Outro'],
    },
    otherHousingCondition: {
      type: String,
      required() {
        return this.housingCondition === 'Outro';
      },
    },

    hasChildren: Boolean,
    childrenLivingWith: Number,
    childrenLivingWithYou: Number,

    familyIncome: {
      type: String,
      enum: [
        'UM SALÁRIO',
        'MENOS DE UM SALÁRIO',
        'MAIS DE UM SALÁRIO',
        'NÃO DECLAROU',
        'Outro',
      ],
    },

    hasCriminalRecord: Boolean,

    substanceUse: Boolean,
    substanceDetails: {
      type: String,
      required() {
        return this.substanceUse === true;
      },
    },

    /* ------------------------------------------------------------------
     * VIOLÊNCIA
     * ------------------------------------------------------------------ */
    relationshipWithAuthor: {
      type: String,
      enum: [
        'MARIDO',
        'EX CÔNJUGE',
        'NAMORADO',
        'FILHO',
        'IRMÃO',
        'PADRASTO',
        'PAI',
        'EX NAMORADO',
        'Outro',
      ],
      required: true,
    },
    otherRelationshipWithAuthor: {
      type: String,
      required() {
        return this.relationshipWithAuthor === 'Outro';
      },
    },

    violenceTypes: {
      type: [String],
      enum: ['FÍSICA', 'PSICOLÓGICA', 'SEXUAL', 'PATRIMONIAL', 'MORAL'],
    },

    hasViolenceMarks: Boolean,
    currentViolenceTypes: {
      type: [String],
      enum: ['FÍSICA', 'PSICOLÓGICA', 'SEXUAL', 'PATRIMONIAL', 'MORAL'],
      required() {
        return this.hasViolenceMarks === true;
      },
    },

    authorNotified: Boolean,

    protectiveMeasuresComplied: Boolean,
    nonComplianceDetails: {
      type: String,
      required() {
        return this.protectiveMeasuresComplied === false;
      },
    },

    contactFrequency: {
      type: String,
      enum: [
        'DIARIAMENTE',
        'SEMANALMENTE',
        'MENSALMENTE',
        'OCASIONALMENTE',
        'NÃO HOUVE CONTATO',
      ],
      required: true,
    },
    lastContactPeriod: {
      type: String,
      enum: [
        'UM A SETE DIAS',
        'UMA A DUAS SEMANAS',
        'DUAS SEMANAS A UM MÊS',
        'UM A SEIS MESES',
        'UM ANO OU MAIS',
      ],
      required: true,
    },

    /* ------------------------------------------------------------------
     * AUTOR
     * ------------------------------------------------------------------ */
    authorName: { type: String, required: true },
    authorAddress: { type: String, required: true },
    authorPerimeter: { type: String, required: true },

    authorGender: {
      type: String,
      enum: ['FEMININO', 'MASCULINO'],
      required: true,
    },

    authorEmploymentStatus: {
      type: String,
      enum: ['EMPREGADO', 'DESEMPREGADO', 'AUTÔNOMO', 'APOSENTADO', 'Outro'],
      required: true,
    },

    authorHasCriminalRecord: Boolean,
    authorHasBeenArrested: Boolean,

    authorAlcoholUse: Boolean,
    authorAlcoholUseFrequency: {
      type: String,
      enum: [
        'DIARIAMENTE',
        'SEMANALMENTE',
        'MENSALMENTE',
        'OCASIONALMENTE',
        'NÃO USA',
      ],
      required() {
        return this.authorAlcoholUse === true;
      },
    },

    authorChemicalDependencyTreatment: Boolean,
    authorMentalDisorder: Boolean,
    authorControlledMedicationUse: Boolean,

    authorNotifiedAboutProtectiveMeasures: Boolean,

    /* ------------------------------------------------------------------ */
    generalObservations: String,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

export default mongoose.model('VictimQuestionnaire', VictimQuestionnaireSchema);
