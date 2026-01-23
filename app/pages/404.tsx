"use client"
import { Card, CardContent } from "@/app/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/app/components/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-4 border-2 border-white/10 bg-card/80 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-white">404 - Realm Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            The coordinates you entered seem to lead to the Void. 
            Better turn back before it's too late.
          </p>

          <div className="mt-8">
            <Link href="/">
              <Button className="w-full">
                Return Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
