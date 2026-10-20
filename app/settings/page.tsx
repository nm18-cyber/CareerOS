import { requireChatGPTUser } from "../chatgpt-auth";
import SettingsPanel from "./settings-panel";
export const dynamic="force-dynamic";
export default async function SettingsPage(){const user=await requireChatGPTUser("/settings");return <SettingsPanel name={user.fullName??user.email}/>;}
