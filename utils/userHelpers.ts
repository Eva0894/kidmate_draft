export function getUserIdSafe(id: string | string[] | null | undefined): string | null {
    if (!id) return null;
    return Array.isArray(id) ? id[0] : id;
  }
  