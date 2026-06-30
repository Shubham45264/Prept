import * as clerk from "@clerk/nextjs";
console.log("Clerk exports:", Object.keys(clerk).filter(k => k.includes("Sign") || k.includes("Show") || k.includes("User")));
