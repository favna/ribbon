import { ApplyOptions } from '@root/components/Utils';
import { Language, ScheduledTask, ScheduledTaskJSON, SchemaEntry, Serializer, SerializerOptions } from 'klasa';

@ApplyOptions<SerializerOptions>({ aliases: [ 'schedules', 'ScheduledTask' ] })
export default class ScheduledTaskSerializer extends Serializer {
  async deserialize(data: ScheduledTask | ScheduledTaskJSON, entry: SchemaEntry, language: Language) {
    console.log('deserializing');

    if (data instanceof ScheduledTask) return data;
    try {
      const task = new ScheduledTask(this.client, data.taskName, data.time, { catchUp: data.catchUp || true, data: data.data || {}, id: data.id });

      return task;
    } catch {
      throw language.get('RESOLVER_INVALID_TASK', entry.key);
    }
  }

  serialize(data: ScheduledTask): string {
    console.log('serializing');

    return JSON.stringify(data.toJSON());
  }
}