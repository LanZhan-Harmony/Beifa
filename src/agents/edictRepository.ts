import type { EdictRecord } from "@/types/edictType";

const STORAGE_KEY = "mandate.edicts.v2";

/**
 * 将可能来自 Vue 响应式状态的奏折转换为普通可持久化对象。
 * EdictRecord 只包含 JSON 数据；JSON 往返也会移除嵌套的 Proxy，避免 structuredClone 失败。
 */
function cloneRecord(record: EdictRecord): EdictRecord {
  return JSON.parse(JSON.stringify(record)) as EdictRecord;
}

export class EdictRepository {
  private records: EdictRecord[] = [];

  load(seed: EdictRecord[]): EdictRecord[] {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as EdictRecord[];
      const byId = new Map(seed.map((item) => [item.id, structuredClone(item)]));
      for (const item of saved) {
        if (item?.id) {
          byId.set(item.id, item);
        }
      }
      this.records = [...byId.values()];
    } catch {
      this.records = seed.map((item) => structuredClone(item));
    }
    this.persist();
    return this.all();
  }

  all(): EdictRecord[] {
    return this.records.map((item) => structuredClone(item));
  }
  pending(): EdictRecord[] {
    return this.all().filter((item) => item.status === "pending");
  }
  upsert(record: EdictRecord): void {
    const storedRecord = cloneRecord(record);
    const index = this.records.findIndex((item) => item.id === record.id);
    if (index >= 0) {
      this.records[index] = storedRecord;
    } else {
      this.records.push(storedRecord);
    }
    this.persist();
  }
  addMany(records: EdictRecord[]): void {
    records.forEach((record) => this.upsert(record));
  }
  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
  }
}

export const edictRepository = new EdictRepository();
