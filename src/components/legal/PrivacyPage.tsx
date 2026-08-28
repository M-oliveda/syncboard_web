import { Shield } from "lucide-react";

import { LegalDocument } from "@/components/legal/LegalDocument";

export function PrivacyPage() {
    return (
        <LegalDocument
            icon={<Shield className="size-8" />}
            title="Privacy Policy"
            description="Your privacy is critically important to us. At SyncBoard, we have a few fundamental principles regarding the information we collect and how we handle it."
            lastUpdated="October 24, 2023"
            sections={[
                {
                    id: "collection",
                    number: 1,
                    title: "Information We Collect",
                    children: (
                        <>
                            <p>
                                We only collect information about you if we have a
                                reason to do so &mdash; for example, to provide our
                                services, to communicate with you, or to make our
                                services better.
                            </p>
                            <div className="gap-stack-md grid grid-cols-1 md:grid-cols-2">
                                <div className="bg-surface p-stack-md flex flex-col gap-2 rounded-xl">
                                    <h4 className="text-on-background m-0 font-bold">
                                        Provided by you
                                    </h4>
                                    <p className="text-body-sm text-on-surface-variant m-0">
                                        Account info, payment details, and content you
                                        create or upload.
                                    </p>
                                </div>
                                <div className="bg-surface p-stack-md flex flex-col gap-2 rounded-xl">
                                    <h4 className="text-on-background m-0 font-bold">
                                        Collected automatically
                                    </h4>
                                    <p className="text-body-sm text-on-surface-variant m-0">
                                        Log data, device information, and usage
                                        statistics via cookies.
                                    </p>
                                </div>
                            </div>
                        </>
                    ),
                },
                {
                    id: "usage",
                    number: 2,
                    title: "How We Use Data",
                    children: (
                        <p>
                            We use the information we collect to provide, maintain, and
                            improve our services, to develop new ones, and to protect
                            SyncBoard and our users. We also use this information to
                            offer you more relevant, tailored content.
                        </p>
                    ),
                },
                {
                    id: "security",
                    number: 3,
                    title: "Data Security",
                    children: (
                        <p>
                            While no online service is 100% secure, we work hard to
                            protect information about you against unauthorized access,
                            use, alteration, or destruction, and take reasonable
                            measures to do so, such as monitoring our services for
                            potential vulnerabilities and attacks.
                        </p>
                    ),
                },
                {
                    id: "rights",
                    number: 4,
                    title: "Your Rights",
                    children: (
                        <>
                            <p>
                                Depending on your location, you may have certain rights
                                regarding your personal information, including the right
                                to:
                            </p>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>Request access to your personal information.</li>
                                <li>
                                    Request correction or deletion of your personal
                                    information.
                                </li>
                                <li>
                                    Object to our use and processing of your personal
                                    information.
                                </li>
                                <li>
                                    Request that we limit our use and processing of your
                                    personal information.
                                </li>
                            </ul>
                        </>
                    ),
                },
                {
                    id: "changes",
                    number: 5,
                    title: "Changes to This Policy",
                    children: (
                        <p>
                            We may change our Privacy Policy from time to time. We
                            encourage visitors to check this page for any changes. Your
                            continued use of the services after any change to this
                            Privacy Policy constitutes your consent to that change.
                        </p>
                    ),
                },
            ]}
        />
    );
}
