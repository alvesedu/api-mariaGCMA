import VictimQuestionnaire from '../models/VictimQuestionnaire';
import AuthorQuestionnaire from '../models/AuthorQuestionnaire';

class ReportController {
  // 1) Vítimas por mês (último ano)
  async victimsPerMonth(req, res) {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const data = await VictimQuestionnaire.aggregate([
        { $match: { created_at: { $gte: oneYearAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$created_at' } },
            count: { $sum: 1 },
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      return res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  }

  // 2) Tipos de violência (quebra)
  async violenceTypesBreakdown(req, res) {
    try {
      const data = await VictimQuestionnaire.aggregate([
        { $unwind: '$violenceTypes' },
        {
          $group: {
            _id: '$violenceTypes',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      return res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  }

  // 3) Autores por município
  async authorsByMunicipality(req, res) {
    try {
      const data = await AuthorQuestionnaire.aggregate([
        {
          $group: {
            _id: '$authorMunicipality',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      return res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  }

  // 4) Média de filhos por vítima e por autor
  async avgChildren(req, res) {
    try {
      const [victimsAgg] = await VictimQuestionnaire.aggregate([
        { $group: { _id: null, avgChildren: { $avg: '$childrenLivingWith' } } }
      ]);
      const [authorsAgg] = await AuthorQuestionnaire.aggregate([
        { $group: { _id: null, avgChildren: { $avg: '$numberOfChildrenWithVictim' } } }
      ]);

      return res.json({
        victimsAvg: victimsAgg?.avgChildren || 0,
        authorsAvg: authorsAgg?.avgChildren || 0
      });
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  }

  // 5) Casos por condição de moradia × renda familiar (vítimas)
  async housingIncome(req, res) {
    try {
      const data = await VictimQuestionnaire.aggregate([
        {
          $match: {
            housingCondition: { $exists: true },
            familyIncome:    { $exists: true }
          }
        },
        {
          $group: {
            _id: { housing: '$housingCondition', income: '$familyIncome' },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            housing: '$_id.housing',
            income:  '$_id.income',
            count:   1,
            _id:     0
          }
        }
      ]);

      return res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  }

  // 6) Distribuição etária de vítimas e autores (faixas)
  async ageDistribution(req, res) {
    try {
      const now = new Date();

      const buildPipeline = (dateField) => [
        {
          $project: {
            age: {
              $floor: {
                $divide: [
                  { $subtract: [now, `$${dateField}`] },
                  1000 * 60 * 60 * 24 * 365
                ]
              }
            }
          }
        },
        {
          $bucket: {
            groupBy: "$age",
            boundaries: [0, 18, 31, 51, 200],
            default: ">200",
            output: { count: { $sum: 1 } }
          }
        },
        {
          $project: {
            _id: 0,
            label: {
              $switch: {
                branches: [
                  { case: { $lt: ["$_id", 18] }, then: "<18" },
                  { case: { $and: [{ $gte: ["$_id", 18] }, { $lt: ["$_id", 31] }] }, then: "18–30" },
                  { case: { $and: [{ $gte: ["$_id", 31] }, { $lt: ["$_id", 51] }] }, then: "31–50" },
                  { case: { $gte: ["$_id", 51] }, then: ">50" }
                ],
                default: "Unknown"
              }
            },
            count: 1
          }
        },
        {
          $group: {
            _id: "$label",
            count: { $sum: "$count" }
          }
        },
        {
          $project: { _id: 0, label: "$_id", count: 1 }
        }
      ];

      const [victims, authors] = await Promise.all([
        VictimQuestionnaire.aggregate(buildPipeline('birthDate')),
        AuthorQuestionnaire.aggregate(buildPipeline('authorBirthDate'))
      ]);

      return res.json({ victims, authors });
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  }
}

export default new ReportController();
