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
  console.log("Webhook received");

  if (req.method !== "POST") {
    console.log("Invalid method:", req.method);
    return new Response("Method not allowed", { status: 405 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("Missing Stripe signature header");
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const body = await req.text();
  console.log("Raw webhook body received:", body);

  let event: Stripe.Event;
  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    // Use async constructEventAsync instead of synchronous constructEvent
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", (err as Error).message);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  console.log("Webhook event verified:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("Checkout session object:", session);

    const user_id = session.metadata?.user_id;
    console.log("User ID from metadata:", user_id);

    if (!user_id) {
      console.error("User ID missing in metadata.");
      return new Response("User ID missing in metadata", { status: 400 });
    }

    try {
      // Adjust 'profiles' and 'id' if your table or column is named differently
      const { error } = await supabase
        .from("profiles")      // Confirm this is your actual table name
        .update({ has_premium: true })
        .eq("id", user_id);   // Confirm this column matches your primary key

      if (error) {
        console.error("Supabase update error:", error.message);
        return new Response("Failed to update user premium status", { status: 500 });
      }

      console.log(`✅ User ${user_id} premium status updated.`);
    } catch (e) {
      console.error("Unexpected error updating user premium:", e);
      return new Response("Internal server error", { status: 500 });
    }
  } else {
    console.log("Unhandled event type:", event.type);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
