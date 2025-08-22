'use client'

import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label";

import Link from "next/link";

export default function LoginPage(){

    const [email , setEmail] = useState('');
    const [password , setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async () =>{
        setError(null);
        setLoading(true);

        const {error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if(error){
            setError(error.message);
            setLoading(false);
            return;
        }
        else{
            router.push('/dashboard');
            router.refresh();
        }
    };




    return (
        <div className="flex justify-center items-center h-full">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-3xl">Login</CardTitle>
                    <CardDescription >
                        Enter your email below to login to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <div className="grid gap-4">
                        <Label htmlFor="email">
                            Email
                        </Label>
                        <Input id="email" type="email" placeholder="johndoe@exmaple.com" required value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="grid gap-4">
                        <Label htmlFor="password">
                          Password
                        </Label>
                        <Input id="password" type="password" required value = {password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <Button className="w-full" onClick={handleLogin} >
                        {loading ? 'Loading...' : 'Sign in'}
                    </Button>
                </CardContent>

                <div className="text-center">
                    Don't have an account? {' '}  
                    <Link href="/signup" className="underline">
                    Sign up
                    </Link>
                </div>

            </Card>

        </div>
    )
}