import { Injectable } from "@nestjs/common";

@Injectable()
export class CurrentBusinessService {
  private businessId: string | null = null;

  setBusinessId(businessId: string): void {
    this.businessId = businessId;
  }

  getBusinessId(): string {
    if (!this.businessId) {
      throw new Error('ID de negocio no establecido en el contexto');
    }
    return this.businessId;
  }

  clear(): void {
    this.businessId = null;
  }
}