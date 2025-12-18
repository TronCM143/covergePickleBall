"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        // Temporarily just redirect to details page (frontend only)
        //firebase auth
        router.push("/booking");
    };

    const handleGuestLogin = () => {
        // Temporarily redirect as guest
        //firebase auth for anonymous login
        router.push("/booking");
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 mx-8 py-16">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Welcome Back</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <Input
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button className="w-full mt-2" onClick={handleLogin}>
                        Login
                    </Button>
                    <div className="text-center mt-4">
                        <span className="text-sm text-gray-500">or</span>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={handleGuestLogin}
                    >
                        Login as Guest
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
