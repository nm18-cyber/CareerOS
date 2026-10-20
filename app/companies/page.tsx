import {requireChatGPTUser} from '../chatgpt-auth';
import NetworkTracker from '../../components/network-tracker';
export const dynamic='force-dynamic';
export default async function Page(){const u=await requireChatGPTUser('/companies');return <NetworkTracker name={u.fullName??u.email} kind="companies"/>;}
