import { ObjectId, type Db, type Collection } from "mongodb";
import type { SessionPackType } from "@gymora/shared";

export interface SessionPackDoc {
  _id?: ObjectId;
  gymId: ObjectId;
  memberId: ObjectId;
  trainerId: ObjectId | null;
  type: SessionPackType;
  sessionsPurchased: number;
  sessionsUsed: number;
  pricePaid: number;
  paymentMethod: "CASH" | "UPI" | "OTHER";
  purchasedAt: Date;
  expiresAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class SessionPackRepo {
  private col: Collection<SessionPackDoc>;
  constructor(db: Db) {
    this.col = db.collection<SessionPackDoc>("session_packs");
  }

  listActiveByMember(memberId: ObjectId, gymId: ObjectId) {
    const now = new Date();
    return this.col
      .find({
        memberId,
        gymId,
        $expr: { $gt: ["$sessionsPurchased", "$sessionsUsed"] },
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: now } },
        ],
      })
      .sort({ purchasedAt: -1 })
      .toArray();
  }

  listAllByMember(memberId: ObjectId, gymId: ObjectId) {
    return this.col
      .find({ memberId, gymId })
      .sort({ purchasedAt: -1 })
      .toArray();
  }

  listByTrainerInGym(trainerId: ObjectId, gymId: ObjectId) {
    return this.col
      .find({ trainerId, gymId })
      .sort({ purchasedAt: -1 })
      .toArray();
  }

  findByIdInGym(id: string, gymId: ObjectId) {
    return this.col.findOne({ _id: new ObjectId(id), gymId });
  }

  async create(doc: Omit<SessionPackDoc, "_id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    return this.col.insertOne({ ...doc, createdAt: now, updatedAt: now });
  }

  async incrementSessionsUsed(
    id: ObjectId,
    gymId: ObjectId,
    count: number
  ) {
    return this.col.findOneAndUpdate(
      { _id: id, gymId },
      {
        $inc: { sessionsUsed: count },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );
  }

  /** Total count of active sessions (remaining) for a member */
  async totalRemainingForMember(
    memberId: ObjectId,
    gymId: ObjectId
  ): Promise<number> {
    const packs = await this.listActiveByMember(memberId, gymId);
    return packs.reduce(
      (sum, p) => sum + (p.sessionsPurchased - p.sessionsUsed),
      0
    );
  }
}