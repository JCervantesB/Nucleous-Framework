export enum WellKnownBucket {
  AVATARS = 'avatars',
  PRODUCTS = 'products',
  DOCUMENTS = 'documents',
  BACKUPS = 'backups',
}

export class StorageBucket {
  private constructor(
    private readonly props: { name: string; isPublic: boolean },
  ) {}

  static create(name: string, isPublic: boolean = true): StorageBucket {
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre del bucket no puede estar vacío');
    }
    return new StorageBucket({ name: name.toLowerCase(), isPublic });
  }

  static avatars(): StorageBucket {
    return new StorageBucket({ name: WellKnownBucket.AVATARS, isPublic: true });
  }

  static products(): StorageBucket {
    return new StorageBucket({
      name: WellKnownBucket.PRODUCTS,
      isPublic: true,
    });
  }

  static documents(): StorageBucket {
    return new StorageBucket({
      name: WellKnownBucket.DOCUMENTS,
      isPublic: false,
    });
  }

  static backups(): StorageBucket {
    return new StorageBucket({
      name: WellKnownBucket.BACKUPS,
      isPublic: false,
    });
  }

  static fromWellKnown(bucket: WellKnownBucket): StorageBucket {
    switch (bucket) {
      case WellKnownBucket.AVATARS:
        return StorageBucket.avatars();
      case WellKnownBucket.PRODUCTS:
        return StorageBucket.products();
      case WellKnownBucket.DOCUMENTS:
        return StorageBucket.documents();
      case WellKnownBucket.BACKUPS:
        return StorageBucket.backups();
    }
  }

  get name(): string {
    return this.props.name;
  }

  get isPublic(): boolean {
    return this.props.isPublic;
  }

  toString(): string {
    return this.props.name;
  }
}
