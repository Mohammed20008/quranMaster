
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" }
      },
      async authorize(credentials) {
        // Mock authentication for "Fast and Effective" testing
        // In production, verify against database here
        if (credentials?.email) {
          return {
            id: "user-1",
            name: credentials.name || "Test User",
            email: credentials.email,
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.name || 'User'}`
          }
        }
        return null
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: '/', 
    error: '/', // Redirect back to home/modal on error instead of ugly error page
  },
  callbacks: {
    async session({ session, token }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
})

export { handler as GET, handler as POST }
