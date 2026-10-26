import {requireUser} from '../../../lib/access';
import ResumeManager from "../resume-manager";
export const dynamic="force-dynamic";
export default async function ResumesPage(){const user=await requireUser();return <ResumeManager name={user.fullName??user.email}/>;}
