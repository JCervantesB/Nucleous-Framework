export interface CustomerProps {
  id: string;
  businessId: string;
  userId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isGuest: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export class Customer {
  readonly id: string;
  readonly businessId: string;
  userId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  readonly isGuest: boolean;
  isActive: boolean;
  readonly createdAt: Date;
  updatedAt: Date | null;

  constructor(props: CustomerProps) {
    this.id = props.id;
    this.businessId = props.businessId;
    this.userId = props.userId;
    this.email = props.email;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.phone = props.phone;
    this.isGuest = props.isGuest;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  linkToUser(userId: string): void {
    if (!this.isGuest) {
      throw new Error("Solo clientes guest pueden vincularse a un usuario");
    }
    this.userId = userId;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  toProps(): CustomerProps {
    return {
      id: this.id,
      businessId: this.businessId,
      userId: this.userId,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      isGuest: this.isGuest,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
