import { requireChatGPTUser } from "../chatgpt-auth";
import { currentUser } from "../../lib/access";
import HomeDashboard from "./dashboard";
export const dynamic="force-dynamic";
export default async function HomePage(){const user=await currentUser();if(!user){await requireChatGPTUser("/home")}return <HomeDashboard name={user!.fullName??user!.email}/>;}
