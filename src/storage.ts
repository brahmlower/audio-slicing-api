
import { promises as fs } from 'fs';
import { Buffer } from 'buffer';

export interface StorageService {
  getFile(file_id: string): Uint8Array;
  storeFile(file_id: string, data: Uint8Array);
  getChunk(file_id: string, start_index: number, num_bytes: number);
}

export class FileSystemStorage {
  base_filepath: string;
  constructor(base_filepath: string) {
    this.base_filepath = base_filepath;
  }

  async getFile(file_id: string): Promise<Uint8Array> {
    return fs.readFile(`${this.base_filepath}/${file_id}`);
  }

  async storeFile(file_id: string, data: Uint8Array) {
    await fs.writeFile(`${this.base_filepath}/${file_id}`, data);
  }

  async getChunk(file_id, start_index, num_bytes) {
    // const file_buffer = await this.getFile(file_id);
    const buffer = Buffer.alloc(num_bytes);
    const fd = await fs.open(`${this.base_filepath}/${file_id}`, 'r');

    // From conversation about not crashing when reading beyond the end of the file
    // if (start_index + num_bytes > fd.max_length) {
    //   num_bytes = fd.max_length - start_index;
    // }

    await fd.read(buffer, 0, num_bytes, start_index);
    return buffer;
  }
}