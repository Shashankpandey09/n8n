import { Prisma } from "@shashankpandey/prisma/generated/prisma";

function getDeepValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export const parse_Node_Parameters = (
  parameters: Record<string, any>,
  parent_node_Output: Prisma.JsonValue
): Record<string, any> => {
  console.log( parent_node_Output)


  if (!parent_node_Output ) return parameters;
  const regex = /\{\{\$json\.([^\}]+)\}\}/g;
  const parsed: Record<string, any> = {};

  for (const key of Object.keys(parameters)) {
    const value = parameters[key];
    if (typeof value === "string") {
      parsed[key] = value.replace(regex, (_, path) => {
        const resolved = getDeepValue(parent_node_Output, path.trim());
        return resolved !== undefined ? String(resolved) : "";
      });
    } else {
      parsed[key] = value; 
    }
  }

  return parsed;
};
