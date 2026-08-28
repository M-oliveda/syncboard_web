import { FileText } from "lucide-react";

import { LegalDocument } from "@/components/legal/LegalDocument";

export function TermsPage() {
    return (
        <LegalDocument
            icon={<FileText className="size-8" />}
            title="Terms of Service"
            description='These Terms of Service ("Terms") govern your access to and use of the SyncBoard platform, websites, and services. Please read them carefully before using our services.'
            lastUpdated="October 24, 2023"
            sections={[
                {
                    id: "acceptance",
                    number: 1,
                    title: "Acceptance of Terms",
                    children: (
                        <p>
                            By accessing or using the SyncBoard service, you agree to be
                            bound by these Terms and our Privacy Policy. If you are
                            using the service on behalf of an organization, you are
                            agreeing to these Terms for that organization and
                            representing that you have the authority to bind that
                            organization to these Terms.
                        </p>
                    ),
                },
                {
                    id: "accounts",
                    number: 2,
                    title: "User Accounts",
                    children: (
                        <>
                            <p>
                                You must provide accurate and complete information when
                                creating an account. You are responsible for
                                safeguarding the password that you use to access the
                                service and for any activities or actions under your
                                password. We encourage you to use &ldquo;strong&rdquo;
                                passwords (a combination of upper and lower case
                                letters, numbers, and symbols) with your account.
                            </p>
                            <div className="bg-surface-container p-stack-md rounded-xl">
                                <p className="text-body-sm text-on-surface-variant m-0 italic">
                                    Note: You must notify us immediately upon becoming
                                    aware of any breach of security or unauthorized use
                                    of your account.
                                </p>
                            </div>
                        </>
                    ),
                },
                {
                    id: "acceptable-use",
                    number: 3,
                    title: "Acceptable Use",
                    children: (
                        <>
                            <p>
                                You agree not to misuse the SyncBoard services. For
                                example, you must not, and must not attempt to:
                            </p>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>
                                    Probe, scan, or test the vulnerability of any system
                                    or network.
                                </li>
                                <li>
                                    Breach or otherwise circumvent any security or
                                    authentication measures.
                                </li>
                                <li>
                                    Access, tamper with, or use non-public areas of the
                                    service.
                                </li>
                                <li>
                                    Interfere with or disrupt any user, host, or
                                    network.
                                </li>
                                <li>
                                    Send altered, deceptive, or false source-identifying
                                    information, including &ldquo;spoofing&rdquo; or
                                    &ldquo;phishing&rdquo;.
                                </li>
                            </ul>
                        </>
                    ),
                },
                {
                    id: "intellectual-property",
                    number: 4,
                    title: "Intellectual Property",
                    children: (
                        <p>
                            The Service and its original content (excluding content
                            provided by users), features, and functionality are and will
                            remain the exclusive property of SyncBoard and its
                            licensors. The Service is protected by copyright, trademark,
                            and other applicable laws.
                        </p>
                    ),
                },
                {
                    id: "liability",
                    number: 5,
                    title: "Limitation of Liability",
                    children: (
                        <p>
                            In no event shall SyncBoard, nor its directors, employees,
                            partners, agents, suppliers, or affiliates, be liable for
                            any indirect, incidental, special, consequential, or
                            punitive damages, including without limitation loss of
                            profits, data, use, goodwill, or other intangible losses,
                            resulting from your access to or use of or inability to
                            access or use the Service.
                        </p>
                    ),
                },
            ]}
        />
    );
}
