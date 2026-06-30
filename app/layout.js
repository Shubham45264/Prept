import { DM_Sans } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { Lora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Header from "@/components/Header";
import { StarsBackground } from "@/components/animate-ui/components/backgrounds/stars";
import { Toaster } from "@/components/ui/sonner";

const lora = Lora({subsets:['latin'],weight:["400","500"],style:["normal","italic"],variable:"--font-serif"})

const dmSans = DM_Sans({
  subsets:["latin"],
  weight:["300","400","500","600"],
  variable:"--font-sans"
})

export const metadata = {
  title:"Prept",
  description:"Practice for your next interview with AI."
};

export default function RootLayout({children}) {
  return (
    <ClerkProvider appearance={{theme:dark,}}>
    <html lang="en" suppressHydrationWarning>
      <body className={`${lora.variable} ${dmSans.variable} font-sans bg-black text-white relative`}>
        {/* Global Stars Backdrop */}
        <StarsBackground className="fixed inset-0 -z-50 w-screen h-screen pointer-events-none" />
        
        {/* Header */}
        <Header/>
        
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          
          <main className="min-h-screen relative z-10">
            {children}
          </main>

          <Toaster richColors/>

           {/* {Footer} */}

         <footer className="relative z-10 w-full border-t border-white/10 py-12 mx-auto px-6 flex flex-wrap items-center justify-center text-stone-400">
         Made with ❤️ by Shubham
         </footer>

        </ThemeProvider>
      </body>
    </html>
  
</ClerkProvider>
  )
}
