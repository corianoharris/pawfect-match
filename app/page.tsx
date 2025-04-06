"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PawPrint } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import Link from "next/link"
import { exampleUserLogin } from "@/mockData/user"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      toast({
        title: "Login successful!",
        description: "Welcome to Pawfect Match Dog Adoption",
      })

      router.push("/dogs")
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-turquoise-100 to-turquoise-50 dark:from-turquoise-900 dark:to-turquoise-800 p-4"
      aria-labelledby="login-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card
          className="shadow-xl border-turquoise-200 dark:border-turquoise-700 overflow-hidden"
          role="region"
          aria-labelledby="login-title"
        >
          <CardHeader className="space-y-1 text-center bg-gradient-to-r from-turquoise-400 to-turquoise-500 text-white">
            <motion.div
              className="flex justify-center mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            >
              <PawPrint className="h-16 w-16 text-white" aria-hidden="true" />
            </motion.div>
            <CardTitle id="login-title" className="text-3xl font-bold" tabIndex={0}>
              Pawfect Match
            </CardTitle>
            <CardDescription className="text-turquoise-50" tabIndex={0}>
              Find your perfect furry companion
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" aria-label="Login form" noValidate>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-turquoise-700 dark:text-turquoise-300 font-medium" htmlFor="name">
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="name"
                            placeholder={exampleUserLogin.username}
                            className="border-turquoise-200 focus:border-turquoise-400 dark:border-turquoise-700"
                            aria-required="true"
                            aria-describedby="name-error"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage id="name-error" aria-live="polite" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-turquoise-700 dark:text-turquoise-300 font-medium" htmlFor="email">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            placeholder={exampleUserLogin.email}
                            type="email"
                            className="border-turquoise-200 focus:border-turquoise-400 dark:border-turquoise-700"
                            aria-required="true"
                            aria-describedby="email-error"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage id="email-error" aria-live="polite" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-turquoise-500 to-turquoise-600 hover:from-turquoise-600 hover:to-turquoise-700 text-white font-medium py-2.5"
                    disabled={isLoading}
                    aria-disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center text-sm text-muted-foreground bg-turquoise-50 dark:bg-turquoise-900/30 py-4">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              tabIndex={0}
            >
              Enter your details to start finding your perfect dog match
            </motion.p>
            <div
              className="flex flex-col items-start justify-start mt-4 bg-turquoise-50 dark:bg-turquoise-900/30 py-4 rounded-md w-max p-2"
              aria-label="Demo credentials"
              tabIndex={0}
            >
              <p className="font-semibold w-max">Demo username: {exampleUserLogin.username}</p>
              <p className="font-semibold w-max">Demo password: {exampleUserLogin.email}</p>
            </div>
          </CardFooter>
        </Card>
        <div className="text-center mt-4 hidden" tabIndex={0}>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-turquoise-500 hover:underline dark:text-turquoise-300"
            aria-label="Register for a new account"
          >
            Register
          </Link>
        </div>
      </motion.div>
    </main>
  )
}

