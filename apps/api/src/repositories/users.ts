import { ObjectId, type Db, type Collection } from "mongodb";
import { COLLECTIONS } from "@gymora/db";
import { ROLES, type Role, type Permission } from "@gymora/shared";

export interface UserDoc {
  _id?: ObjectId;
  gymId: ObjectId | null;
  role: Role;
  name: string;
  email: string;
  passwordHash: string;
  status: "ACTIVE" | "DISABLED";
  permissions: Permission[];
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserRepo {
  private col: Collection<UserDoc>;
  constructor(db: Db) {
    this.col = db.collection<UserDoc>(COLLECTIONS.USERS);
  }
  findByEmail(email: string) {
    return this.col.findOne({ email: email.toLowerCase() });
  }
  findById(id: string) {
    return this.col.findOne({ _id: new ObjectId(id) });
  }
  create(doc: Omit<UserDoc, "_id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    return this.col.insertOne({ ...doc, createdAt: now, updatedAt: now });
  }
  touchLogin(id: ObjectId) {
    return this.col.updateOne(
      { _id: id },
      { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
    );
  }
}