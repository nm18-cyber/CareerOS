import { redirect } from "next/navigation";
import { currentUser } from "../lib/access";
import { safeReturnPath } from "../lib/auth-path";

export type ChatGPTUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

export const getChatGPTUser = currentUser;

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await currentUser();

  if (user) {
    return user;
  }

  redirect(chatGPTSignInPath(returnTo));
}

export function chatGPTSignInPath(returnTo: string) {
  return `/login?return_to=${encodeURIComponent(
    safeReturnPath(returnTo),
  )}`;
}

export function chatGPTSignOutPath() {
  return "/logout";
}
