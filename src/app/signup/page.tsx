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
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div >
      <Card >
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent >
          <div >
            <Label>Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div >
            <Label>Password</Label>
            <Input id="password" type="password" required />
          </div>
          <Button className="w-full">Create account</Button>
        </CardContent>
        <div className="mb-6 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </Card>
    </div>
  );
}