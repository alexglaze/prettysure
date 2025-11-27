// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Todo: a.model({
    content: a.string(),
  }).authorization((allow) => [allow.owner()]), // per-user records
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    // Data client (generateClient) signs API requests with the userPool token
    defaultAuthorizationMode: "userPool",
  },
});
