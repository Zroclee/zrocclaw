import { getConfigPath, getHistoryPath } from './manager';
import fs from 'fs';
import path from 'path';

export interface SessionDataItem extends Record<string, any> {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface SessionData {
  sessionId: string | null;
  sessionData: SessionDataItem[];
  history: string[];
}

class SessionModel {
  private static instance: SessionModel;
  private filePath: string;
  private data: SessionData;

  private constructor() {
    this.filePath = path.join(getConfigPath(), 'session.json');
    this.data = {
      sessionId: null,
      sessionData: [],
      history: [],
    };
    this.load();
  }

  public static getInstance(): SessionModel {
    if (!SessionModel.instance) {
      SessionModel.instance = new SessionModel();
    }
    return SessionModel.instance;
  }

  private load(): void {
    if (fs.existsSync(this.filePath)) {
      try {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = {
          sessionId: parsed.sessionId ?? this.data.sessionId,
          sessionData: Array.isArray(parsed.sessionData) ? parsed.sessionData : [],
          history: Array.isArray(parsed.history) ? parsed.history : [],
        };
      } catch (error) {
        console.error('Failed to parse session.json:', error);
      }
    } else {
      // 文件不存在就创建一个
      this.save();
    }
  }

  private save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save session.json:', error);
    }
  }

  public getSessionId(): string | null {
    this.load();
    return this.data.sessionId;
  }

  public setSessionId(id: string | null): void {
    if (this.data.sessionId !== id) {
      this.data.sessionData = [];
    }
    this.data.sessionId = id;
    this.save();
  }

  public getSessionData(): SessionDataItem[] {
    this.load();
    return this.data.sessionData;
  }

  public addSessionItem(item: SessionDataItem): void {
    this.load();
    this.data.sessionData.push(item);
    if (this.data.sessionData.length > 100) {
      const sessionId = this.data.sessionId ?? 'session';
      const index = (this.data.history?.length ?? 0) + 1;
      const filename = `${sessionId}${index}.json`;
      const historyFilePath = getHistoryPath(filename);
      const toArchive = this.data.sessionData.slice(0, 70);
      try {
        fs.writeFileSync(historyFilePath, JSON.stringify(toArchive, null, 2), 'utf-8');
        this.data.history.push(filename);
        this.data.sessionData = this.data.sessionData.slice(70);
      } catch (error) {
        console.error('Failed to archive session history:', error);
      }
    }
    this.save();
  }
}

export const sessionModel = SessionModel.getInstance();
export default sessionModel;
