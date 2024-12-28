import { NextResponse } from "next/server";

type CallbackResponse = {
  success: boolean;
  data: any;
  feedback: string[] | null;
  error: string | null;
};

/**
 * Crée un objet de réponse formaté
 * @template T - Type de callback (ICallback ou ICallbackForUser etc.)
 */
export const createResponse = <CallbackResponse>(
  success: boolean,
  data: any = null,
  feedback: string[] | null = null,
  error: string | null = null,
  status: number
): NextResponse<CallbackResponse> => {
  return NextResponse.json(
    {
      success,
      data,
      feedback,
      error,
    } as CallbackResponse,
    { status }
  );
};
