import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface IStorageProvider {
  saveFile(file: Express.Multer.File, subfolder?: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
}

export class LocalStorageProvider implements IStorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = config.storage.uploadDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, subfolder: string = ''): Promise<string> {
    const targetDir = subfolder ? path.join(this.baseDir, subfolder) : this.baseDir;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    const targetPath = path.join(targetDir, filename);

    if (file.buffer) {
      await fs.promises.writeFile(targetPath, file.buffer);
    } else if (file.path) {
      await fs.promises.rename(file.path, targetPath);
    }

    const relativeUrl = subfolder ? `/uploads/${subfolder}/${filename}` : `/uploads/${filename}`;
    return relativeUrl;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      if (!fileUrl.startsWith('/uploads/')) return false;
      const relativePath = fileUrl.replace('/uploads/', '');
      const filePath = path.join(this.baseDir, relativePath);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (err) {
      logger.error('Error deleting file:', err);
      return false;
    }
  }
}

export class StorageService {
  private provider: IStorageProvider;

  constructor() {
    this.provider = new LocalStorageProvider();
  }

  async uploadImage(file: Express.Multer.File, category: 'avatars' | 'masters' | 'products' = 'avatars'): Promise<string> {
    return this.provider.saveFile(file, category);
  }

  async deleteImage(fileUrl: string): Promise<boolean> {
    return this.provider.deleteFile(fileUrl);
  }
}

export const storageService = new StorageService();
