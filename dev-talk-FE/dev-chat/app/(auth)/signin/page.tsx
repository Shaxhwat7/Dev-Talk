'use client'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import axios from 'axios'
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function SignIn() {
  const [username, setusername] = useState("")
  const [pass, setPass] = useState("")
  const router = useRouter();
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:3001/create-user', {
        username,
        pass
      })
      toast.success('User created successfully')
      localStorage.setItem("user", JSON.stringify({ username }));
      router.push('/dashboard')
      console.log(response.data)
    } catch (e: any) {
      toast.error('Something went wrong')
      console.error(e)
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <form onSubmit={createUser}>
          <CardHeader>
            <CardTitle>Login to continue</CardTitle>
            
          </CardHeader>
          <br/>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Username</Label>
                <Input
                  id="username"
                  type="string"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setusername(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <br/>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full">
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
