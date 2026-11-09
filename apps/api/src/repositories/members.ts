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
  trainerId: ObjectId | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Only fetch fields the API actually returns — reduces payload & memory
const LIST_PROJECTION = {
  fullName: 1,
  phone: 1,
  email: 1,
  address: 1,
  joiningDate: 1,
  planId: 1,
  membershipStartDate: 1,
  expiryDate: 1,
  isInactive: 1,
  advanceBalance: 1,
  trainerId: 1,
  notes: 1,
  createdAt: 1,
} as const;

// Even lighter — for hydration lookups (name only)
const NAME_PROJECTION = { fullName: 1 } as const;

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

  /**
   * Batch hydrate member names. Single DB query for N members.
   * Use this instead of calling findByIdInGym in a loop.
   */
  async findManyByIdsInGym(
    ids: ObjectId[],
    gymId: ObjectId
  ): Promise<Array<{ _id: ObjectId; fullName: string }>> {
    if (ids.length === 0) return [];
    return this.col
      .find({ _id: { $in: ids }, gymId }, { projection: NAME_PROJECTION })
      .toArray() as unknown as Promise<Array<{ _id: ObjectId; fullName: string }>>;
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
      trainerId: input.trainerId ? new ObjectId(input.trainerId) : null,
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
    if (patch.advanceBalance !== undefined)
      set.advanceBalance = Math.max(0, patch.advanceBalance);
    if (patch.trainerId !== undefined) {
      set.trainerId = patch.trainerId ? new ObjectId(patch.trainerId) : null;
    }

    const res = await this.col.findOneAndUpdate(
      { _id: new ObjectId(id), gymId },
      { $set: set },
      { returnDocument: "after" }
    );
    return res;
  }

  async adjustAdvanceBalance(id: ObjectId, gymId: ObjectId, delta: number) {
    if (delta === 0) return this.col.findOne({ _id: id, gymId });
    return this.col.findOneAndUpdate(
      { _id: id, gymId },
      {
        $inc: { advanceBalance: delta },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );
  }

  /**
   * List members with projection.
   * NOTE: We no longer return `total` — removed for performance.
   * If you need total, use `/api/gym/dashboard` counts.
   */
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

    const docs = await this.col
      .find(filter, { projection: LIST_PROJECTION })
      .sort({ expiryDate: 1 })
      .skip(query.offset)
      .limit(query.limit)
      .toArray();

    return { docs };
  }
}
