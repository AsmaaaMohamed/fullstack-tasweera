"use client"

import { SignupHeader } from "@/components/artist/auth/SignUpForm/SignupHeader"
import SignUpForm from "@/components/artist/auth/SignUpForm"

export default function SignUpPage() {
  return (
    <div className="">
      <div className="mx-auto px-4 py-8">
        <SignupHeader />
        <SignUpForm />
      </div>
    </div>
  )
}
