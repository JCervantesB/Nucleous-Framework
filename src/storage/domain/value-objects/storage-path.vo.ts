export class StoragePath {
  private constructor(
    private readonly props: { path: string; normalized: string },
  ) {}

  static create(bucket: string, ...parts: string[]): StoragePath {
    const pathParts = [bucket, ...parts.filter(Boolean)];
    const normalized = pathParts.join('/').replace(/\/+/g, '/');
    return new StoragePath({ path: normalized, normalized });
  }

  static fromUrl(url: string): StoragePath | null {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.slice(1);
      return new StoragePath({ path, normalized: path });
    } catch {
      return null;
    }
  }

  static fromKey(key: string): StoragePath {
    const normalized = key.replace(/^\/+/, '');
    return new StoragePath({ path: normalized, normalized });
  }

  get path(): string {
    return this.props.path;
  }

  get parts(): string[] {
    return this.props.normalized.split('/').filter(Boolean);
  }

  get bucket(): string {
    return this.parts[0] ?? '';
  }

  get filename(): string {
    const parts = this.parts;
    return parts[parts.length - 1] ?? '';
  }

  get folder(): string {
    const parts = this.parts;
    return parts.slice(0, parts.length - 1).join('/');
  }

  toString(): string {
    return this.props.normalized;
  }
}
