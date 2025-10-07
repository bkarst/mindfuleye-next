/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";
import { Card, CardHeader, CardBody, Divider } from "@heroui/react";
import { COMPANY_NAME } from "../constants";

const PrivacyPolicy = () => {
  const address = "24 Miriam St., San Francisco, CA";
  const companyName = COMPANY_NAME;
  const emailContact = "ben.karst@gmail.com";

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-3 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-8">

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Introduction</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {companyName} is committed to protecting and respecting your privacy. This Privacy Policy describes how we collect, store, use and distribute personal data through our software, website, mobile application (&quot;App&quot;), documentation, and related services (together, the &quot;Services&quot;). In this Privacy Policy, references to &quot;you&quot; means the person whose personal data we collect, use and process. Please read this Privacy Policy carefully to understand our treatment and use of personal data. We will use your personal data only for the purposes and in the manner outlined below, and in compliance with applicable laws.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Please note that by using the Services, you acknowledge that you have read and understand this Privacy Policy. If you choose to create a user account, you will be asked to provide an email address and password so that we can identify you across devices and comply with any potential request to delete or access your data. We will also ask you for an optional referral code, which we may use to track your participation in special programs, described in more detail below. You can also choose to skip account creation and create an account locally on your device: note that without an account, you will not be able to recover your data or log in on a different device.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Identity of the Controller of Personal Information</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The data controller for {companyName} Inc. Platforms is {companyName}, a company and registered in the United States and having its registered office address at {address}.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Contact Details of the Data Protection Officer / Representative</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {companyName}'s Data Protection Officer can be contacted at {emailContact}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">When does this Privacy Policy apply</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The Privacy Policy applies to personal data that we collect, use and otherwise process about you in connection with your use of the Services
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Processing of your Personal Data</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                How and why do we process your personal data? When you use the Services, we may collect and process different personal data about you. The personal data we process, the basis of processing and the purposes of processing are detailed below. Sometimes, these activities are carried out by third parties (see "Sharing of Personal Data" section below). We encourage you to supply only the information you are comfortable with.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Information from Other Sources</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may obtain information about you from other sources, including through third party services and organizations to supplement information provided by you. For example, if you access our Services through a third-party application, such as an app store, a third-party login service, or a social networking site, we may collect information about you from that third-party application that you have made public via your privacy settings. This supplemental information allows us to verify information that you have provided to us and to enhance our ability to provide you with information about our business, products, and Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Analytics Vendors</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may also use Google Analytics and other service providers such as Bugsnag to collect information regarding visitor behavior and visitor demographics on our Services. For more information about Google Analytics, please visit www.google.com/policies/privacy/partners/. You can opt out of Google's collection and processing of data generated by your use of the Services by going to http://tools.google.com/dlpage/gaoptout. For more information about Bugsnag, visit www.bugsnag.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Use of De-identified and Aggregated Information</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may use personal information and other data about you to create de-identified and aggregated information, such as general location information, information about the computer or device from which you access our Services, or other analyses we create. We may share this information with the parties listed in "Sharing of Personal Data" below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Where does {companyName} obtain my personal data from?</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Most of the personal data we process is obtained from you when, through the application you: register for a {companyName} account and exchange messages with {companyName}. Other types of personal data may be obtained from third parties, including, for example, your name and time zone from Facebook.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Sharing of Personal Data with Third Parties</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We do not share your personal data with third parties, except as provided below.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1. Service Providers</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We use third party service providers who provide technical and support services to help us provide and improve the product and Services. In providing the Services, these third party service providers may have limited access to databases of user information or registered member information solely for the purpose of helping us to improve the product and they will be subject to contractual restrictions prohibiting them from using the personal data of our members for any other purpose.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2. Disclosure through Facebook Messenger with third parties</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You may be able to share Personal Information with third parties through use of the Services. The privacy policies of these third parties are not under our control and may differ from ours. The use of any information that you may provide to any third parties will be governed by the privacy policy of such third party or by your independent agreement with such third party, as the case may be. If you have any doubts about the privacy of the information you are providing to a third party, we recommend that you contact that third party directly for more information or to review its privacy policy. Users that access {companyName} via the Facebook Messenger platform are also subject to Facebook's privacy policy. Facebook's Privacy Policy can be found here: https://www.facebook.com/privacy/explanation.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">3. Disclosure to Third Parties for Special Programs</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                If you participate in the special program, we will share the outcome of your participation in the program (as measured by your survey responses, engagement and satisfaction metrics) with the program partner, which may include your employer, certification authorities, or other medical and academic partners who help conduct the study. The results of your study do not contain your messages with {companyName}. Note that your participation in special programs may be governed by terms outside of this Privacy Policy. At any point you may also withdraw your consent to have your personal data used in the special program by contacting us as set forth below. If you withdraw your consent to share personal data, you may continue to use {companyName}'s standard features.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">4. Disclosure to other third parties</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                In certain circumstances, we share and/or are obliged to share your personal data with third parties for the purposes described above and in accordance with applicable law, including if we, in good faith, believe doing so is required or appropriate to comply with law enforcement or national security requests and legal process, such as a court order or subpoena; protect your, our or others' rights, property, or safety; enforce our policies or contracts; collect amounts owed to us; assist with an investigation or prosecution of suspected or actual illegal activity or as otherwise allowed under applicable law. These third parties include: administrative authorities (tax or social security authorities) financial institutions insurance companies police, public prosecutors, regulators external advisors We may also disclose your personal data in connection with a corporate re-organization, a merger or amalgamation with another entity, a sale of all or a substantial portion of our assets or stock, including any due diligence exercise carried out in relation to the same, provided that the information disclosed continues to be used for the purposes permitted by this Privacy Policy by the entity acquiring the information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Transfer outside the European Economic Area/UK</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Your personal data may be transferred, stored and processed in one or more countries outside the European Economic Area ("EEA") or the UK, for example, when one of our service providers use employees or equipment based outside the EEA or UK. For transfers of your personal data to third parties outside of the EEA or UK, we take additional steps in line with applicable law. We will put in place adequate safeguards with respect to the protection of your privacy, fundamental rights and freedoms, and the exercise of your rights, e.g. we will establish an adequate level of data protection through EU Standard Contractual Clauses based on the EU Commission's model clauses. If you would like to see a copy of any relevant provisions, please contact {companyName}'s Data Protection Officer / Representative (see "Contact Us" section below).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">How is my Personal Data secured</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {companyName} operates and uses appropriate technical and physical security measures to protect your personal data. We have, in particular, taken appropriate security measures to protect your personal data from accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access. Access is only granted on a need-to-know basis to those people whose roles require them to process your personal data. You are also responsible for helping to protect the security of your personal data. For instance, safeguard your user name, password and personal credentials when you are using the Services, so that other people will not have access to your personal data. Furthermore, you are responsible for maintaining the security of any device on which you utilize the Services. Unfortunately, no system is 100% secure, and we cannot ensure or warrant the security of any personal data you provide to us. To the fullest extent permitted by applicable law, we do not accept liability for unintentional disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Storage of Personal Data</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We will keep your personal data for as long as it is necessary to fulfill the purposes for which it was collected as described above and in accordance with our legal and regulatory obligations. If you would like further information about our data retention practices you can ask for this at any time (see "Contact Us" section below).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Your rights</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You may have various rights under data protection legislation in your country (where applicable). These may include (as relevant): The right of access enables you to check what type of personal data we hold about you and what we do with that personal data and to receive a copy of this personal data; The right to object to processing of your personal data where that processing is carried out on the basis of our legitimate interests; The right to rectification enables you to correct any inaccurate or incomplete personal data that we hold about you; The right to erasure enables you to request that we erase personal data held about you in certain circumstances; The right to restrict processing of your personal data by us in certain cases, including if you believe that the personal data held about you is inaccurate or our use of the personal data is unlawful; and The right to data portability enables you to receive your personal data in a structured, commonly used and machine readable format and to have that personal data transmitted to another data controller. Note that we will require you to take steps to verify your identity in accordance with applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">"Do not Track"</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Do Not Track ("DNT") is a privacy preference that users can set in certain web browsers. Please note that we do not respond to or honor DNT signals or similar mechanisms transmitted by web browsers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Children's Information</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The Services are not directed to children under 13 (or other age as required by local law), and we do not knowingly collect personal data from children. If you learn that your child has provided us with personal data without your consent, you may contact us as set forth below. If we learn that we have collected any personal data in violation of applicable law, we will promptly take steps to delete such personal data and terminate the child's account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Your right to lodge a complaint with a Supervisory Authority</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If you are unhappy about any aspect of the way we collect, share or use your personal data, please let us know using the contact details below. You also have a right to complain to your local Data Protection Authority if you prefer. Contact details for Data Protection Authorities in the EU are available at ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Changes to this Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may need to make changes to this Privacy Policy at any time. If we make any material changes to how we collect your personal data, or how we use or share it, we will post or provide appropriate notice in accordance with applicable law. In order to ensure fairness of the processing, we encourage you to review the content of this Privacy Policy regularly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                For further information, to exercise your rights, or if you have any questions or queries about this Privacy Policy, please contact {companyName}'s Data Protection Officer; email: {emailContact}, postal: {address}
              </p>
            </section>

          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
