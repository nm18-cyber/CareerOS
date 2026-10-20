import { requireChatGPTUser } from "../chatgpt-auth";
import JobBoard from "./board";
export const dynamic="force-dynamic";
export default async function JobsPage(){const user=await requireChatGPTUser("/jobs");return <JobBoard name={user.fullName??user.email}/>;}
