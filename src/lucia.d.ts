/// <reference types="lucia-auth" />
declare namespace Lucia {
  type Auth = import('./lib/lucia.js').Auth;
  type DatabaseUserAttributes = {
    email: string;
    name: string;
    token: string;
  };
  type DatabaseSessionAttributes = {};
}
