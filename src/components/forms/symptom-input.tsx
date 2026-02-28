"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SymptomInputProps {
    placeholder?: string;
    buttonText?: string;
    className?: string;
}

export function SymptomInput({
    placeholder = "What's bothering you today?",
    buttonText = "Check my symptoms",
    className = "",
}: SymptomInputProps) {
    const [symptoms, setSymptoms] = useState("");
    const router = useRouter();

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const params = new URLSearchParams();
        if (symptoms.trim()) {
            params.set("symptoms", symptoms.trim());
        }
        params.set("redirect", "/ai-doctor");
        router.push(`/login?${params.toString()}`);
    }

    return (
        <form onSubmit={handleSubmit} className={className}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                    type="text"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder={placeholder}
                    className="h-12 flex-1 rounded-xl border border-[#D8E6E6] bg-[#F4F9FB] px-4 text-sm text-[#1D3557] placeholder:text-[#97938d] outline-none focus:border-[#2A9D8F] transition-colors"
                />
                <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-[#2A9D8F] px-5 text-sm font-semibold text-white hover:bg-[#21867a] transition-colors cursor-pointer"
                >
                    {buttonText}
                </button>
            </div>
        </form>
    );
}
