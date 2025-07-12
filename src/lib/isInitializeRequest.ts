import { InitializeRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// 이 함수는 stateful-connection에서만 사용된다
export const isInitializeRequest = (
  body: ReadableStream<Uint8Array<ArrayBufferLike>> | null
): boolean => {
  const isInitial = (data: any) => {
    const result = InitializeRequestSchema.safeParse(data);
    return result.success;
  };
  if (Array.isArray(body)) {
    return body.some((request) => isInitial(request));
  }
  return isInitial(body);
};
