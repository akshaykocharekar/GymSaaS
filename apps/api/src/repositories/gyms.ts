import { ObjectId, type Db, type Collection, type Filter } from "mongodb";
import { COLLECTIONS } from "@gymora/db";
import { GYM_STATUS, type GymStatus } from "@gymora/shared";

export interface GymDoc {
  _id?: ObjectId;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string | null;
  status: GymStatus;
  trialStartAt: Date | null;
  trialExpiresAt: Date | null;
  licencePurchasedAt: Date | null;
  licenceExpiresAt: Date | null;
  activationCodeHash: string | null;
  activationCodeExpiresAt: Date | null;
  activationCodeUsedAt: Date | null;
  suspendedReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class GymRepo {
  private col: Collection<GymDoc>;
  constructor(db: Db) {
    this.col = db.collection<GymDoc>(COLLECTIONS.GYMS);
  }

  findByEmail(email: string) {
    return this.col.findOne({ email: email.toLowerCase() });
  }
  findById(id: string) {
    return this.col.findOne({ _id: new ObjectId(id) });
  }
  create(doc: Omit<GymDoc, "_id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const _doc: GymDoc = { ...doc, createdAt: now, updatedAt: now };
    return this.col.insertOne(_doc);
  }
  async updateByEmail(
    email: string,
    patch: Partial<GymDoc>
  ): Promise<GymDoc | null> {
    const res = await this.col.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { ...patch, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return res ?? null;
  }
  async updateById(id: string, patch: Partial<GymDoc>): Promise<GymDoc | null> {
    const res = await this.col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...patch, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return res ?? null;
  }
  listByStatus(status: GymStatus) {
    return this.col.find({ status }).sort({ createdAt: -1 }).toArray();
  }
  countByStatus(status: GymStatus) {
    return this.col.countDocuments({ status });
  }
  listAll() {
    return this.col.find({}).sort({ createdAt: -1 }).toArray();
  }

  async listPaged(opts: {
    search?: string;
    status?: GymStatus;
    limit: number;
    offset: number;
  }) {
    const filter: Filter<GymDoc> = {};
    if (opts.status) filter.status = opts.status;
    if (opts.search && opts.search.trim()) {
      const escaped = opts.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
        { ownerName: { $regex: escaped, $options: "i" } },
        { phone: { $regex: escaped } },
      ];
    }
    const [docs, total] = await Promise.all([
      this.col
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(opts.offset)
        .limit(opts.limit)
        .toArray(),
      this.col.countDocuments(filter),
    ]);
    return { docs, total };
  }

  async countsByStatus() {
    const agg = await this.col
      .aggregate<{ _id: GymStatus; count: number }>([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ])
      .toArray();
    const map: Record<string, number> = {};
    for (const row of agg) map[row._id] = row.count;
    return map;
  }
}
