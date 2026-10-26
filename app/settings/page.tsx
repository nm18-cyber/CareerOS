import {requireUser} from '../../lib/access';
import SettingsPanel from "./settings-panel";
export const dynamic="force-dynamic";
export default async function SettingsPage(){const user=await requireUser();return <SettingsPanel name={user.fullName??user.email}/>;}
