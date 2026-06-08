import { Injectable } from "@nestjs/common";

@Injectable()
export class CurrentBusinessService {
  private businessId: string | null = null;

  setBusinessId(businessId: string): void {
    this.businessId = businessId;
  }

  getBusinessId(): string {
    if (!this.businessId) {
      throw new Error("Business ID not set in context");
    }
    return this.businessId;
  }

  clear(): void {
    this.businessId = null;
  }
}