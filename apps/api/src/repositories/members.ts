import { ObjectId, type Db, type Collection } from "mongodb";
import { COLLECTIONS } from "@gymora/db";
import type {
  MemberListQuery,
  CreateMemberInput,
  UpdateMemberInput,
} from "@gymora/shared";

export interface MemberDoc {
  _id?: ObjectId;
  gymId: ObjectId;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  joiningDate: Date;
  planId: ObjectId;
  membershipStartDate: Date;
  expiryDate: Date;
  isInactive: boolean;
  advanceBalance: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class MemberRepo {
  private col: Collection<MemberDoc>;
  constructor(db: Db) {
    this.col = db.collection<MemberDoc>(COLLECTIONS.MEMBERS);
  }

  countByGym(gymId: ObjectId) {
    return this.col.countDocuments({ gymId });
  }

  findByIdInGym(id: string, gymId: ObjectId) {
    return this.col.findOne({ _id: new ObjectId(id), gymId });
  }

  create(gymId: ObjectId, expiryDate: Date, input: CreateMemberInput) {
    const now = new Date();
    return this.col.insertOne({
      gymId,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email || null,
      address: input.address || null,
      joiningDate: input.joiningDate,
      planId: new ObjectId(input.planId),
      membershipStartDate: input.membershipStartDate,
      expiryDate,
      isInactive: false,
      advanceBalance: 0,
      notes: input.notes || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  async updateInGym(
    id: string,
    gymId: ObjectId,
    patch: UpdateMemberInput & {
      expiryDate?: Date;
      isInactive?: boolean;
      advanceBalance?: number;
    }
  ) {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (patch.fullName !== undefined) set.fullName = patch.fullName;
    if (patch.phone !== undefined) set.phone = patch.phone;
    if (patch.email !== undefined) set.email = patch.email || null;
    if (patch.address !== undefined) set.address = patch.address || null;
    if (patch.joiningDate !== undefined) set.joiningDate = patch.joiningDate;
    if (patch.planId !== undefined) set.planId = new ObjectId(patch.planId);
    if (patch.membershipStartDate !== undefined)
      set.membershipStartDate = patch.membershipStartDate;
    if (patch.notes !== undefined) set.notes = patch.notes || null;
    if (patch.expiryDate !== undefined) set.expiryDate = patch.expiryDate;
    if (patch.isInactive !== undefined) set.isInactive = patch.isInactive;
    if (patch.advanceBalance !== undefined) set.advanceBalance = patch.advanceBalance;

    const res = await this.col.findOneAndUpdate(
      { _id: new ObjectId(id), gymId },
      { $set: set },
      { returnDocument: "after" }
    );
    return res;
  }

  /** Atomically increment/decrement advance balance. Returns updated doc. */
  async adjustAdvanceBalance(id: string, gymId: ObjectId, delta: number) {
    const res = await this.col.findOneAndUpdate(
      { _id: new ObjectId(id), gymId },
      {
        $inc: { advanceBalance: delta },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );
    return res;
  }

  async list(gymId: ObjectId, query: MemberListQuery) {
    const now = new Date();
    const filter: Record<string, unknown> = { gymId };

    if (query.filter === "active") {
      filter.isInactive = false;
      filter.expiryDate = { $gte: now };
    } else if (query.filter === "expired") {
      filter.isInactive = false;
      filter.expiryDate = { $lt: now };
    } else if (query.filter === "inactive") {
      filter.isInactive = true;
    } else if (query.filter === "expiring") {
      const cutoff = new Date(now.getTime() + query.expiringInDays * 86_400_000);
      filter.isInactive = false;
      filter.expiryDate = { $gte: now, $lte: cutoff };
    }

    if (query.q && query.q.trim()) {
      const q = query.q.trim();
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { fullName: { $regex: `^${escaped}`, $options: "i" } },
        { phone: { $regex: escaped } },
      ];
    }

    const [docs, total] = await Promise.all([
      this.col
        .find(filter)
        .sort({ expiryDate: 1 })
        .skip(query.offset)
        .limit(query.limit)
        .toArray(),
      this.col.countDocuments(filter),
    ]);
    return { docs, total };
  }
}