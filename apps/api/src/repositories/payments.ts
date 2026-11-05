import { ObjectId, type Db, type Collection } from "mongodb";
import { COLLECTIONS } from "@gymora/db";
import type { PaymentMethod } from "@gymora/shared";

export interface PaymentDoc {
  _id?: ObjectId;
  gymId: ObjectId;
  memberId: ObjectId;
  amount: number;
  method: PaymentMethod;
  paymentDate: Date;
  note: string | null;
  recordedByUserId: ObjectId;
  createdAt: Date;
}

export class PaymentRepo {
  private col: Collection<PaymentDoc>;
  constructor(db: Db) {
    this.col = db.collection<PaymentDoc>(COLLECTIONS.PAYMENTS);
  }

  create(doc: Omit<PaymentDoc, "_id" | "createdAt">) {
    return this.col.insertOne({ ...doc, createdAt: new Date() });
  }

  listByGym(
    gymId: ObjectId,
    opts: { memberId?: ObjectId; method?: PaymentMethod; limit: number; offset: number }
  ) {
    const filter: Record<string, unknown> = { gymId };
    if (opts.memberId) filter.memberId = opts.memberId;
    if (opts.method) filter.method = opts.method;
    return this.col
      .find(filter)
      .sort({ paymentDate: -1, createdAt: -1 })
      .skip(opts.offset)
      .limit(opts.limit)
      .toArray();
  }

  listByMemberInGym(memberId: ObjectId, gymId: ObjectId) {
    return this.col
      .find({ gymId, memberId })
      .sort({ paymentDate: -1, createdAt: -1 })
      .toArray();
  }

  async sumThisMonth(gymId: ObjectId): Promise<number> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const agg = await this.col
      .aggregate<{ total: number }>([
        { $match: { gymId, paymentDate: { $gte: start } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray();
    return agg[0]?.total ?? 0;
  }

  async sumAllTime(gymId: ObjectId): Promise<number> {
    const agg = await this.col
      .aggregate<{ total: number }>([
        { $match: { gymId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray();
    return agg[0]?.total ?? 0;
  }
}