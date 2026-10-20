import { requireChatGPTUser } from "../../chatgpt-auth";
import ResumeManager from "../resume-manager";
export const dynamic="force-dynamic";
export default async function ResumesPage(){const user=await requireChatGPTUser("/resume-builder/resumes");return <ResumeManager name={user.fullName??user.email}/>;}
