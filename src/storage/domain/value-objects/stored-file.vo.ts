export interface StoredFileMetadata {
  size: number;
  mimeType: string;
  originalName: string;
  uploadedAt: Date;
  businessId?: string;
}

export interface StoredFileUrl {
  url: string;
  expiresAt?: Date;
  isSigned: boolean;
}

export class StoredFile {
  private constructor(
    private readonly props: {
      id: string;
      bucket: string;
      key: string;
      metadata: StoredFileMetadata;
      url: StoredFileUrl;
    },
  ) {}

  static create(params: {
    id?: string;
    bucket: string;
    key: string;
    metadata: StoredFileMetadata;
    url: StoredFileUrl;
  }): StoredFile {
    return new StoredFile({
      id: params.id ?? crypto.randomUUID(),
      bucket: params.bucket,
      key: params.key,
      metadata: params.metadata,
      url: params.url,
    });
  }

  static fromProps(props: {
    id: string;
    bucket: string;
    key: string;
    metadata: StoredFileMetadata;
    url: StoredFileUrl;
  }): StoredFile {
    return new StoredFile(props);
  }

  get id(): string {
    return this.props.id;
  }

  get bucket(): string {
    return this.props.bucket;
  }

  get key(): string {
    return this.props.key;
  }

  get metadata(): StoredFileMetadata {
    return this.props.metadata;
  }

  get url(): StoredFileUrl {
    return this.props.url;
  }

  get publicUrl(): string {
    return this.props.url.url;
  }

  get size(): number {
    return this.props.metadata.size;
  }

  get mimeType(): string {
    return this.props.metadata.mimeType;
  }

  get originalName(): string {
    return this.props.metadata.originalName;
  }

  get uploadedAt(): Date {
    return this.props.metadata.uploadedAt;
  }

  get businessId(): string | undefined {
    return this.props.metadata.businessId;
  }

  get isExpired(): boolean {
    if (!this.props.url.expiresAt) return false;
    return new Date() > this.props.url.expiresAt;
  }
}
