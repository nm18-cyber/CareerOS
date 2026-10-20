import { currentUser } from "../lib/access";
import CareerHome from "./career-home";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await currentUser();
  return <CareerHome user={user ? { name: user.fullName ?? user.email, email: user.email } : null} />;
}
