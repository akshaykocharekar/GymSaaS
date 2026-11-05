import { ObjectId, type Db, type Collection } from "mongodb";
import { COLLECTIONS } from "@gymora/db";

export interface HistoryDoc {
  _id?: ObjectId;
  gymId: ObjectId;
  memberId: ObjectId;
  planId: ObjectId;
  planName: string;
  durationDays: number;
  startDate: Date;
  expiryDate: Date;
  amountPaid: number | null;
  createdAt: Date;
}

export class HistoryRepo {
  private col: Collection<HistoryDoc>;
  constructor(db: Db) {
    this.col = db.collection<HistoryDoc>(COLLECTIONS.MEMBERSHIP_HISTORY);
  }

  create(doc: Omit<HistoryDoc, "_id" | "createdAt">) {
    return this.col.insertOne({ ...doc, createdAt: new Date() });
  }

  listByMemberInGym(memberId: ObjectId, gymId: ObjectId) {
    return this.col
      .find({ gymId, memberId })
      .sort({ createdAt: -1 })
      .toArray();
  }
}