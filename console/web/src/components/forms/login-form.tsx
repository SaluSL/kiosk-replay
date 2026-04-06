import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { FormTextField } from "@/components/forms/fields/text-field"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
  })
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    const response = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: "/",
    })
    if (response.error) {
      if (response.error.status === 401) {
        toast.error("Error logging in", {
          description: "Invalid email or password.",
        })
      } else {
        toast.error(response.error.statusText, {
          description: response.error.statusText,
        })
      }
      form.resetField("password")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your email and password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <FormTextField
                name="email"
                control={form.control}
                label="Email"
                placeholder="you@example.com"
                autoComplete="email"
              />
              <FormTextField
                name="password"
                control={form.control}
                label="Password"
                type="password"
                autoComplete="current-password"
              />
              <Field>
                <Button type="submit">Login</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
