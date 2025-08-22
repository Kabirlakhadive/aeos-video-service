'use client'

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import Link from 'next/link';

export default function SignupPage() {

    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage , setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    

    const handleSignUp = async () =>{
        setError(null);
        setLoading(true);
        setSuccessMessage(null);

        const{data,error} = await supabase.auth.signUp({
            email,
            password,
        });

        if(error){
            setError(error.message);
        }else{
            setSuccessMessage("Successfully Created and account.")
            setTimeout (() => router.push('/login'), 3000)
            setLoading(false);
        }

    }





  return (
  <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-3xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="johndoe@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-4">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
          </div>
          <Button className="w-full" onClick={handleSignUp}>
            {loading? `loading` : `Create Account`}
          </Button>
        </CardContent>
        <div className="text-center ">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </Card>
    </div>
  );
}