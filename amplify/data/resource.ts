// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Todo: a.model({
    content: a.string(),
  }).authorization((allow) => [allow.owner()]),  // only the owner can CRUD
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    // All data access goes through Cognito user pool tokens
    defaultAuthorizationMode: "userPool",
  },
});
