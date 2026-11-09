import { ObjectId, type Db, type Collection } from "mongodb";
import { COLLECTIONS } from "@gymora/db";
import type {
  CreateTrainerInput,
  UpdateTrainerInput,
  CompensationType,
} from "@gymora/shared";

export interface TrainerDoc {
  _id?: ObjectId;
  gymId: ObjectId;
  name: string;
  phone: string;
  email: string | null;
  joiningDate: Date;
  compensationType: CompensationType;
  commissionPercent: number;
  monthlySalary: number;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class TrainerRepo {
  private col: Collection<TrainerDoc>;
  constructor(db: Db) {
    this.col = db.collection<TrainerDoc>("trainers");
  }

  listByGym(gymId: ObjectId, onlyActive = true) {
    const filter: Record<string, unknown> = { gymId };
    if (onlyActive) filter.isActive = true;
    return this.col.find(filter).sort({ name: 1 }).toArray();
  }

  countByGym(gymId: ObjectId) {
    return this.col.countDocuments({ gymId, isActive: true });
  }

  findByIdInGym(id: string, gymId: ObjectId) {
    return this.col.findOne({ _id: new ObjectId(id), gymId });
  }

  create(gymId: ObjectId, input: CreateTrainerInput) {
    const now = new Date();
    return this.col.insertOne({
      gymId,
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      joiningDate: input.joiningDate,
      compensationType: input.compensationType,
      commissionPercent: input.commissionPercent,
      monthlySalary: input.monthlySalary,
      isActive: true,
      notes: input.notes || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  async updateInGym(
    id: string,
    gymId: ObjectId,
    patch: UpdateTrainerInput
  ) {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (patch.name !== undefined) set.name = patch.name;
    if (patch.phone !== undefined) set.phone = patch.phone;
    if (patch.email !== undefined) set.email = patch.email || null;
    if (patch.compensationType !== undefined)
      set.compensationType = patch.compensationType;
    if (patch.commissionPercent !== undefined)
      set.commissionPercent = patch.commissionPercent;
    if (patch.monthlySalary !== undefined)
      set.monthlySalary = patch.monthlySalary;
    if (patch.isActive !== undefined) set.isActive = patch.isActive;
    if (patch.notes !== undefined) set.notes = patch.notes || null;

    const res = await this.col.findOneAndUpdate(
      { _id: new ObjectId(id), gymId },
      { $set: set },
      { returnDocument: "after" }
    );
    return res;
  }
}