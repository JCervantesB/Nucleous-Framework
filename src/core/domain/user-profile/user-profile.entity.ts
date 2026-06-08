export type UserType = "INTERNAL" | "CUSTOMER" | "PUBLIC";

export interface UserProfileProps {
  id: string;
  userId: string;
  primaryBusinessId: string | null;
  contactId: string | null;
  displayName: string;
  avatarUrl: string | null;
  locale: string;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date | null;
}

export class UserProfile {
  private props: UserProfileProps;

  private constructor(props: UserProfileProps) {
    this.props = props;
  }

  static create(params: {
    userId: string;
    displayName: string;
    primaryBusinessId?: string;
    contactId?: string;
    avatarUrl?: string;
    locale?: string;
    userType: UserType;
  }): UserProfile {
    const now = new Date();
    return new UserProfile({
      id: crypto.randomUUID(),
      userId: params.userId,
      primaryBusinessId: params.primaryBusinessId ?? null,
      contactId: params.contactId ?? null,
      displayName: params.displayName,
      avatarUrl: params.avatarUrl ?? null,
      locale: params.locale ?? "es-MX",
      userType: params.userType,
      createdAt: now,
      updatedAt: null,
    });
  }

  static fromProps(props: UserProfileProps): UserProfile {
    return new UserProfile(props);
  }

  get id() { return this.props.id; }
  get userId() { return this.props.userId; }
  get primaryBusinessId() { return this.props.primaryBusinessId; }
  get contactId() { return this.props.contactId; }
  get displayName() { return this.props.displayName; }
  get avatarUrl() { return this.props.avatarUrl; }
  get locale() { return this.props.locale; }
  get userType() { return this.props.userType; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }
}