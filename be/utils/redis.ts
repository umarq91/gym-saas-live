import { createClient } from "redis";

export let client = createClient({ url: "redis://redis:6379" });


