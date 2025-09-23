import { Transporter } from "nodemailer";

export class CredManager {
  private cred: Map<string, any> = new Map();
  private static instance: CredManager;
   private transporterCache = new Map<number, Transporter>();
  private constructor() {}
  public static getInstance(): CredManager {
    if (!CredManager.instance) {
      CredManager.instance = new CredManager();
      return CredManager.instance;
    }
    return CredManager.instance;
  }
  public setCred(payload: any, platform: string) {
    this.cred.set(platform, payload);
  }
  public getCred(platform: string) {
    return this.cred.get(platform);
  }
  public transporterCacheSet(userID:number,transporter:Transporter){
    this.transporterCache.set(userID,transporter)
  }
  public transporterCacheGet(userID:number){
    if(this.transporterCache.has(userID)){
        return this.transporterCache.get(userID);
    }

  }
}
