// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-08-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", (err as Error).message);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const user_id = session.metadata?.user_id;

    if (user_id) {
      try {
        const { error } = await supabase
          .from("profiles") // <-- double check your actual table name
          .update({ has_premium: true })
          .eq("id", user_id);

        if (error) {
          console.error("Failed to update user premium status:", error.message);
          return new Response("Failed to update user premium status", { status: 500 });
        } else {
          console.log(`User ${user_id} premium status updated.`);
        }
      } catch (e) {
        console.error("Unexpected error updating user premium:", e);
        return new Response("Internal server error", { status: 500 });
      }
    } else {
      console.error("User ID missing in session metadata.");
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
