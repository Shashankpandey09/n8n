export type Node = {
  id: string;
  type: string;
  parameters: any;
  credentials?: Array<string>;
  action: string;
};
export type connections={
  from:string;
  to:string;
}
