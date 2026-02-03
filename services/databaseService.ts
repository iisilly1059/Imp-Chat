
class MiniMongo {
  private storageKey: string;

  constructor(collection: string) {
    this.storageKey = `nexus_db_${collection}`;
  }

  async find(query: any = {}): Promise<any[]> {
    const data = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    return data.filter((item: any) => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  async insertOne(doc: any): Promise<void> {
    const data = await this.find();
    data.push({ ...doc, _id: Math.random().toString(36).substr(2, 9) });
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  async updateOne(query: any, update: any): Promise<void> {
    let data = await this.find();
    data = data.map((item: any) => {
      let match = true;
      for (const key in query) {
        if (item[key] !== query[key]) match = false;
      }
      return match ? { ...item, ...update } : item;
    });
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
}

export const UsersDB = new MiniMongo('users');
export const MessagesDB = new MiniMongo('messages');
export const GroupsDB = new MiniMongo('groups');
