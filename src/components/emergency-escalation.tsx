"use client";

const EMERGENCY_NUMBER = "112";

type EmergencyBannerProps = {
    severity: "high";
    context?: string;
};

export function EmergencyBanner({ context }: EmergencyBannerProps) {
    return (
        <div
            role="alert"
            className="rounded-xl border-2 border-red-300 bg-red-50 p-5"
        >
            <div className="flex items-start gap-3">
                <span className="mt-0.5 text-2xl" aria-hidden="true">
                    🚨
                </span>
                <div className="grid gap-2">
                    <h3 className="text-base font-bold text-red-900">
                        Possible Medical Emergency Detected
                    </h3>
                    <p className="text-sm leading-relaxed text-red-800">
                        Your symptoms may indicate a medical emergency.{" "}
                        <strong>Do not wait for an online consultation.</strong>
                    </p>

                    <div className="mt-1 rounded-lg bg-red-100 p-3">
                        <p className="text-sm font-semibold text-red-900">
                            Take action now:
                        </p>
                        <ol className="mt-2 grid gap-1.5 text-sm text-red-800">
                            <li>
                                1. Call{" "}
                                <a
                                    href={`tel:${EMERGENCY_NUMBER}`}
                                    className="font-bold underline decoration-2"
                                >
                                    {EMERGENCY_NUMBER}
                                </a>{" "}
                                (India national emergency)
                            </li>
                            <li>2. Go to your nearest hospital emergency department</li>
                            <li>
                                3. If someone else is with you, ask them to assist immediately
                            </li>
                        </ol>
                    </div>

                    {context ? (
                        <p className="mt-1 text-xs text-red-600">
                            <strong>What triggered this:</strong> {context}
                        </p>
                    ) : null}

                    <div className="mt-2 flex flex-wrap gap-2">
                        <a
                            href={`tel:${EMERGENCY_NUMBER}`}
                            className="inline-flex items-center gap-2 rounded-full bg-red-700 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-800"
                        >
                            <span aria-hidden="true">📞</span>
                            Call {EMERGENCY_NUMBER} Now
                        </a>
                    </div>

                    <p className="mt-2 text-xs text-red-500">
                        YourDoc is <strong>not</strong> an emergency service. AI health
                        guidance is advisory only and does not replace emergency medical
                        care.
                    </p>
                </div>
            </div>
        </div>
    );
}

export function EscalationNotice() {
    return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl" aria-hidden="true">
                    ⚠️
                </span>
                <div className="grid gap-1.5">
                    <h3 className="text-sm font-bold text-amber-900">
                        Doctor Review Recommended
                    </h3>
                    <p className="text-sm text-amber-800">
                        Based on your symptoms, we recommend scheduling a doctor
                        consultation for a proper clinical assessment. AI guidance alone may
                        not be sufficient for your situation.
                    </p>
                    <p className="mt-1 text-xs text-amber-600">
                        If symptoms worsen or you develop chest pain, difficulty breathing,
                        or loss of consciousness, call{" "}
                        <a
                            href={`tel:${EMERGENCY_NUMBER}`}
                            className="font-semibold underline"
                        >
                            {EMERGENCY_NUMBER}
                        </a>{" "}
                        immediately.
                    </p>
                </div>
            </div>
        </div>
    );
}

export function MedicalDisclaimer() {
    return (
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
            <p className="text-xs leading-relaxed text-stone-500">
                <strong>Medical Disclaimer:</strong> YourDoc provides AI-assisted health
                guidance for informational purposes only. It is not a substitute for
                professional medical advice, diagnosis, or treatment. Always consult a
                qualified healthcare provider for medical decisions. In case of
                emergency, call{" "}
                <a href={`tel:${EMERGENCY_NUMBER}`} className="font-semibold underline">
                    {EMERGENCY_NUMBER}
                </a>
                .
            </p>
        </div>
    );
}
