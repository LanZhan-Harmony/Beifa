import type { EdictRecord } from "@/types/edictType";

const STORAGE_KEY = "mandate.edicts.v2";

export class EdictRepository {
  private records: EdictRecord[] = [];

  load(seed: EdictRecord[]): EdictRecord[] {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as EdictRecord[];
      const byId = new Map(seed.map((item) => [item.id, structuredClone(item)]));
      for (const item of saved) if (item?.id) byId.set(item.id, item);
      this.records = [...byId.values()];
    } catch {
      this.records = seed.map((item) => structuredClone(item));
    }
    this.persist();
    return this.all();
  }

  all(): EdictRecord[] { return this.records.map((item) => structuredClone(item)); }
  pending(): EdictRecord[] { return this.all().filter((item) => item.status === "pending"); }
  upsert(record: EdictRecord): void {
    const index = this.records.findIndex((item) => item.id === record.id);
    if (index >= 0) this.records[index] = structuredClone(record); else this.records.push(structuredClone(record));
    this.persist();
  }
  addMany(records: EdictRecord[]): void { records.forEach((record) => this.upsert(record)); }
  private persist(): void { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records)); }
}

export const edictRepository = new EdictRepository();
