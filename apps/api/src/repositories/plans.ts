import { ObjectId, type Db, type Collection } from "mongodb";
import { COLLECTIONS } from "@gymora/db";
import type { PlanType, CreatePlanInput, UpdatePlanInput } from "@gymora/shared";

export interface PlanDoc {
  _id?: ObjectId;
  gymId: ObjectId;
  name: string;
  type: PlanType;
  durationDays: number;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PlanRepo {
  private col: Collection<PlanDoc>;
  constructor(db: Db) {
    this.col = db.collection<PlanDoc>(COLLECTIONS.MEMBERSHIP_PLANS);
  }

  /** Always tenant-scoped: gymId comes from the JWT, never the client. */
  listByGym(gymId: ObjectId, onlyActive = true) {
    const filter: Record<string, unknown> = { gymId };
    if (onlyActive) filter.isActive = true;
    return this.col.find(filter).sort({ price: 1 }).toArray();
  }

  findByIdInGym(id: string, gymId: ObjectId) {
    return this.col.findOne({ _id: new ObjectId(id), gymId });
  }

  create(gymId: ObjectId, input: CreatePlanInput) {
    const now = new Date();
    return this.col.insertOne({
      gymId,
      name: input.name,
      type: input.type,
      durationDays: input.durationDays,
      price: input.price,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  async updateInGym(id: string, gymId: ObjectId, patch: UpdatePlanInput) {
    const res = await this.col.findOneAndUpdate(
      { _id: new ObjectId(id), gymId },
      { $set: { ...patch, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return res;
  }

  async deactivateInGym(id: string, gymId: ObjectId) {
    return this.updateInGym(id, gymId, { isActive: false } as UpdatePlanInput);
  }

  /** Used at activation time. */
  async seedDefaults(gymId: ObjectId, plans: ReadonlyArray<{ name: string; type: PlanType; durationDays: number; price: number }>) {
    const now = new Date();
    const docs = plans.map((p) => ({ ...p, gymId, isActive: true, createdAt: now, updatedAt: now }));
    await this.col.insertMany(docs);
  }
}