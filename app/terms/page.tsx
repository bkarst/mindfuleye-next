/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";
import { Card, CardHeader, CardBody, Divider } from "@heroui/react";
import { COMPANY_NAME } from "../constants";

const Terms = () => {
  const companyName = COMPANY_NAME;
  const emailContact = "ben.karst@gmail.com";

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-3 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Terms & Conditions</h1>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-8">

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Introduction</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to {companyName} ("we", "our", "us"). These Terms and Conditions ("Terms") govern your use of our website, mobile applications, and any other services or products provided by us (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">1. Account Creation</h2>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1.1. Eligibility</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You must be at least 16 years old to create an account on our Service.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1.2. Account Information</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1.3. Security</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your account. You agree not to disclose your password to any third party.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">2. Subscription Plans</h2>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2.1. Subscription Offerings</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We offer various subscription plans that provide users with different levels of access to our Service.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2.2. Billing and Payments</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Subscription fees are billed on a periodic basis as disclosed at the time of purchase. You agree to pay all charges incurred by your account, including applicable taxes and fees.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2.3. Cancellation</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You can cancel your subscription at any time through your account settings. Note that depending on the subscription plan, there may be no refunds or credits for partial subscription periods.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">3. Feedback</h2>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">3.1. Provision of Feedback</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We welcome and encourage you to provide feedback, comments, and suggestions for improvements to the Service ("Feedback").
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">3.2. No Credits</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You acknowledge and agree that any Feedback you provide will be our exclusive property and that you will not be credited or compensated for such Feedback.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">4. User Conduct</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You agree not to use the Service for any purpose that is unlawful or prohibited by these Terms. You agree to comply with all applicable laws while using the Service.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed ml-4">
                <li>Engage in any harassing, threatening, intimidating, or predatory behavior.</li>
                <li>Use the Service to transmit any computer viruses or malware.</li>
                <li>Use any device, software, or routine to interfere with the proper working of the Service, or to bypass measures we may use to prevent or restrict access to the Service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">5. Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If you have any questions about these Terms, please contact us at {emailContact}.
              </p>
            </section>

          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Terms;
