import {
  InitializeRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// 이 함수는 stateful-connection에서만 사용된다
export const isInitializeRequest = (
  body: ReadableStream<Uint8Array<ArrayBufferLike>> | null
): boolean => {
  const isInitial = (data: any) => {
    // z.infer<typeof InitializeRequestSchema>

    console.debug("🐞 in isInitial, data");
    console.debug(data);

    // 다음의 데이터가 parsing 오류가 발생함
    // { method: 'tools/list', jsonrpc: '2.0', id: 1 }

    const result = InitializeRequestSchema.safeParse(data);
    return result.success;
  };
  if (Array.isArray(body)) {
    return body.some((request) => isInitial(request));
  }
  return isInitial(body);
};
