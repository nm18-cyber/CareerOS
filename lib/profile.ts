import { env } from "cloudflare:workers";

const defaults = {
  next_goal: "Land a new job in the same career path",
  target_title: "Set your target title",
  target_date: "Set your target date",
  salary_range: "Set your salary goal",
  onboarding_json: "[]",
  lesson_done: 0,
};

export async function ensureProfile(userId: string) {
  if (!env.DB) throw new Error("Database unavailable");
  await env.DB.prepare("INSERT OR IGNORE INTO user_profiles (user_id,target_title,target_date,salary_range) VALUES (?,'Set your target title','Set your target date','Set your salary goal')").bind(userId).run();
  return (await env.DB.prepare("SELECT * FROM user_profiles WHERE user_id=?").bind(userId).first()) ?? defaults;
}

export async function markTask(userId: string, task: string) {
  if (!env.DB) return;
  const row = await ensureProfile(userId) as {onboarding_json?:string};
  let done: string[] = [];
  try { done = JSON.parse(row.onboarding_json ?? "[]"); } catch { done = []; }
  if (!done.includes(task)) done.push(task);
  await env.DB.prepare("UPDATE user_profiles SET onboarding_json=?,updated_at=CURRENT_TIMESTAMP WHERE user_id=?").bind(JSON.stringify(done),userId).run();
}
