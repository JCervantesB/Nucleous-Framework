export interface AuditFields {
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
}

export interface AuditInput {
  userId?: string | null;
}

export function buildAuditFields(
  input: AuditInput,
  existingRecord?: AuditFields,
): AuditFields {
  const now = new Date();

  if (existingRecord) {
    return {
      createdAt: existingRecord.createdAt,
      createdBy: existingRecord.createdBy,
      updatedAt: now,
      updatedBy: input.userId ?? null,
    };
  }

  return {
    createdAt: now,
    createdBy: input.userId ?? null,
    updatedAt: null,
    updatedBy: null,
  };
}

export function setUpdatedBy(
  record: AuditFields,
  userId?: string | null,
): AuditFields {
  return {
    ...record,
    updatedAt: new Date(),
    updatedBy: userId ?? null,
  };
}
