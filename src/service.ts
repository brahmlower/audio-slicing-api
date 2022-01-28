
import Knex from 'knex';
import { StorageService } from './storage';
import * as mm from 'music-metadata';
import { v4 as uuid } from 'uuid';

const knex = Knex({client: 'pg'});

const containerExtensions = {
  'WAVE': 'wav',
};

export class AudioRecord {
  id: string;
  name: string;
  duration: string;
  format: string;
  storage_id: string;

  constructor(id, name, duration, format, storage_id) {
    this.id = id;
    this.name = name;
    this.duration = duration;
    this.format = format;
    this.storage_id = storage_id;
  }

  static fromRecord(record: any) {
    return new AudioRecord(
      record.id,
      record.name,
      record.duration,
      record.format,
      record.storage_id,
    );
  }
}

export class AudioFilter {
  name?: string;
  maxduration?: number;

  constructor(params: any) {
    this.name = params.name;
    this.maxduration = parseInt(params.maxduration);
  }
}

export interface QueryResponse<T> {
  num_results: number;
  results: T[];
}

export class AudioService {
  database: any;
  storage: StorageService;

  constructor(database, storage) {
    this.database = database;
    this.storage = storage;
  }

  async saveAudio(data: Buffer, name?: string) {
    // Parse metadata about the audio to find duration
    const metadata = await mm.parseBuffer(data);
    const duration = Math.ceil(metadata.format.duration);
    const extension = containerExtensions[metadata.format.container];
    const storage_id = name || `${uuid()}.${extension}`;

    // Begin storing file to the storage service
    await this.storage.storeFile(storage_id, data);

    const query = knex('audio')
      .returning(['id','name', 'duration', 'storage_id'])
      .insert({ name, duration, storage_id });
    const db_record = await this.database.query(query.toString());
    return AudioRecord.fromRecord(db_record.rows[0]);
  }

  async findAudio(filter: AudioFilter): Promise<QueryResponse<AudioRecord>> {
    const query = knex('audio').select();
    if (filter.name) {
      query.andWhere('name', filter.name);
    }
    if (filter.maxduration) {
      query.andWhere('duration', '<=', filter.maxduration);
    }
    const query_string = query.toString();
    const db_results = await this.database.query(query_string);
    return {
      num_results: db_results.rowCount,
      results: db_results.rows.map(AudioRecord.fromRecord),
    };
  }

  async getFile(audio_record: AudioRecord) {
    return this.storage.getFile(audio_record.storage_id);
  }

  async getChunk(audio_record: AudioRecord, start_index: number, num_bytes: number) {
    return this.storage.getChunk(audio_record.storage_id, start_index, num_bytes);
  }
}
