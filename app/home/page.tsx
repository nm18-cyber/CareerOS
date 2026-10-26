import { requireUser } from "../../lib/access";
import HomeDashboard from "./dashboard";
export const dynamic="force-dynamic";
export default async function HomePage(){const user=await requireUser();return <HomeDashboard name={user.fullName??user.email}/>;}
