import {requireUser} from '../../lib/access';
import JobBoard from "./board";
export const dynamic="force-dynamic";
export default async function JobsPage(){const user=await requireUser();return <JobBoard name={user.fullName??user.email}/>;}
