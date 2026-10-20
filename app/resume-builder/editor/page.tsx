import { requireChatGPTUser } from "../../chatgpt-auth";
import ResumeEditor from "./resume-editor";
export const dynamic="force-dynamic";
export default async function EditorPage(){const user=await requireChatGPTUser("/resume-builder/editor");return <ResumeEditor name={user.fullName??user.email}/>;}
