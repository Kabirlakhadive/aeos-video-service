'use client'

import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label";

import Link from "next/link";

export default function LoginPage(){
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
                </CardHeader>
                <CardContent>
                    <div>
                        <Label>
                            Email
                        </Label>
                        <Input id="email" type="email" placeholder="johndoe@exmaple.com"/>
                    </div>
                    <div>
                        <Label>
                          Password
                        </Label>
                        <Input id="password" type="password" required />
                    </div>
                    <Button className="w-full">
                        Login
                    </Button>
                </CardContent>

                <div>
                    Don't have an account?  
                    <Link href="/signup" className="underline">
                    Sign up
                    </Link>
                </div>

            </Card>

        </div>
    )
}