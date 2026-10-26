import {requireUser} from '../../../lib/access';
import ResumeEditor from "./resume-editor";
export const dynamic="force-dynamic";
export default async function EditorPage(){const user=await requireUser();return <ResumeEditor name={user.fullName??user.email}/>;}
