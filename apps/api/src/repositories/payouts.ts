import { ObjectId, type Db, type Collection } from "mongodb";

export interface PayoutDoc {
  _id?: ObjectId;
  gymId: ObjectId;
  trainerId: ObjectId;
  amount: number;
  period: string; // YYYY-MM
  salaryComponent: number;
  commissionComponent: number;
  paidOn: Date;
  paymentMethod: "CASH" | "UPI" | "OTHER";
  notes: string | null;
  createdAt: Date;
}

export class PayoutRepo {
  private col: Collection<PayoutDoc>;
  constructor(db: Db) {
    this.col = db.collection<PayoutDoc>("trainer_payouts");
  }

  listByTrainer(trainerId: ObjectId, gymId: ObjectId) {
    return this.col
      .find({ trainerId, gymId })
      .sort({ paidOn: -1 })
      .toArray();
  }

  listByGym(gymId: ObjectId, limit = 100) {
    return this.col
      .find({ gymId })
      .sort({ paidOn: -1 })
      .limit(limit)
      .toArray();
  }

  /** Sum of payouts per month for a gym (last 6 months) */
  async totalByMonth(gymId: ObjectId) {
    const now = new Date();
    const monthStarts: { label: string; start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      monthStarts.push({
        label: start.toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        }),
        start,
        end,
      });
    }

    const results = await Promise.all(
      monthStarts.map(async (m) => {
        const agg = await this.col
          .aggregate<{ total: number }>([
            {
              $match: {
                gymId,
                paidOn: { $gte: m.start, $lt: m.end },
              },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
          .toArray();
        return { label: m.label, total: agg[0]?.total ?? 0 };
      })
    );
    return results;
  }

  create(doc: Omit<PayoutDoc, "_id" | "createdAt">) {
    return this.col.insertOne({ ...doc, createdAt: new Date() });
  }
}