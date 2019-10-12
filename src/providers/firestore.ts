import fireadmin from 'firebase-admin';
import { Provider, ScheduledTask } from 'klasa';

export default class extends Provider {
  public db: FirebaseFirestore.Firestore | null = null;

  async init() {
    this.db = fireadmin.firestore();
  }

  async hasTable(table: string) {
    const col = await this.db!.collection(table).get();

    return Boolean(col.size);
  }

  async createTable(table: string) {
    return this.db!.collection(table);
  }

  async getKeys(table: string) {
    const snaps = await this.db!.collection(table).get();

    return snaps.docs.map(snap => snap.id);
  }

  async get(table: string, id: string) {
    const snap = await this.db!.collection(table).doc(id).get();

    return this.packData(snap.data(), snap.id);
  }

  async has(table: string, id: string) {
    const data = await this.db!.collection(table).doc(id).get();

    return data.exists;
  }

  create(table: string, id: string, doc: FirebaseFirestore.DocumentData = {}) {
    doc = this.parseUpdateInput(doc);

    if ((doc as { schedules: ScheduledTask[]}).schedules && doc.schedules.every((schedule: unknown) => schedule instanceof ScheduledTask)) {
      const [ data ] = (doc as { schedules: ScheduledTask[]}).schedules.map(schedule => schedule.toJSON());
      doc = {
        schedules: [
          data
        ],
      };
    }

    return this.db!.collection(table).doc(id).set(doc);
  }

  update(table: string, id: string, doc: FirebaseFirestore.UpdateData) {
    doc = this.parseUpdateInput(doc);

    if ((doc as { schedules: ScheduledTask[]}).schedules && doc.schedules.every((schedule: unknown) => schedule instanceof ScheduledTask)) {
      const [ data ] = (doc as { schedules: ScheduledTask[]}).schedules.map(schedule => schedule.toJSON());
      doc = {
        schedules: [
          data
        ],
      };
    }

    return this.db!.collection(table).doc(id).update(doc);
  }

  delete(table: string, id: string) {
    return this.db!.collection(table).doc(id).delete();
  }

  replace(...args: [string, string, FirebaseFirestore.DocumentData]) {
    return this.create(...args);
  }

  async getAll(table: string, filter: unknown[] = []) {
    const snapshots = await this.db!.collection(table).get();
    const data = snapshots.docs.map(snapshot => this.packData(snapshot.data(), snapshot.id)) as FirebaseFirestore.QueryDocumentSnapshot[];

    return filter.length ? data.filter(nodes => filter.includes(nodes.id)) : data;
  }

  async deleteTable() {
    return undefined;
  }

  packData(data: unknown, id: string) {
    return {
      ...data,
      id,
    };
  }
}