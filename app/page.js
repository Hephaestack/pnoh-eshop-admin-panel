import { redirect } from "next/navigation";

export default function Page() {
  // Server-side redirect to make /login the default landing page
  redirect("/login");
}
