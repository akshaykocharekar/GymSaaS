import { MEMBER_STATUS, type MemberStatus } from "@gymora/shared";

export interface MemberStatusInput {
  expiryDate: Date;
  isInactive: boolean;
}

export function computeMemberStatus(m: MemberStatusInput): MemberStatus {
  if (m.isInactive) return MEMBER_STATUS.INACTIVE;
  return m.expiryDate.getTime() < Date.now()
    ? MEMBER_STATUS.EXPIRED
    : MEMBER_STATUS.ACTIVE;
}