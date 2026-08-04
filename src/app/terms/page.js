export const metadata = {
  title: "Terms of Service | ElevateHours",
  description: "Terms of Service for ElevateHours — the skill-based time-barter marketplace.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-foreground">
      <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: August 4, 2026</p>

      <p className="mb-6">
        Welcome to ElevateHours ("ElevateHours," "we," "us," or "our"), a skill-based
        time-barter marketplace operated by CodeScriptors IT Solutions. These Terms of
        Service ("Terms") govern your access to and use of the ElevateHours website,
        applications, and services (collectively, the "Platform"). By creating an account
        or using the Platform, you agree to be bound by these Terms. If you do not agree,
        do not use the Platform.
      </p>

      <Section title="1. Eligibility">
        <p>
          You must be at least 16 years old to use ElevateHours. If you are between 16
          and 18 years old (or the age of legal majority in your jurisdiction), you may
          only use the Platform under the supervision of a parent or legal guardian who
          agrees to these Terms on your behalf. By using ElevateHours, you represent that
          you meet these requirements.
        </p>
      </Section>

      <Section title="2. Account Types">
        <p>
          ElevateHours supports three account types: Personal, Educator, and
          Organization/NGO. Each account type may have different features, permissions,
          and verification requirements. You agree to select the account type that
          accurately reflects your intended use of the Platform and to provide accurate
          information during registration.
        </p>
      </Section>

      <Section title="3. Sparks: Platform Currency">
        <p>
          ElevateHours operates on an internal currency called Sparks (SPK). Sparks are
          earned by providing skills, services, or time to other users on the Platform and
          may be spent to receive skills, services, or time from other users, or on
          eligible Platform features.
        </p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>
            Sparks have no cash value and are not redeemable or exchangeable for money,
            cryptocurrency, or any other form of legal tender, under any circumstances.
          </li>
          <li>
            Sparks are non-transferable outside the Platform's designated features (e.g.,
            gifting, referral bonuses) and may not be sold, traded, or transferred for
            value outside ElevateHours.
          </li>
          <li>
            We reserve the right to adjust Sparks balances, base rates, multipliers, or
            pricing at our discretion, including in cases of fraud, abuse, or error.
          </li>
          <li>
            Sparks purchases are subject to country-based pricing and a 60-day cooldown on
            changing your registered country for pricing purposes.
          </li>
        </ul>
      </Section>

      <Section title="4. User Conduct">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Misrepresent your skills, qualifications, or identity on the Platform.</li>
          <li>
            Use the Platform for any unlawful purpose or to exploit, harm, or attempt to
            exploit or harm minors.
          </li>
          <li>
            Attempt to buy, sell, or exchange Sparks for real-world currency or value
            outside the Platform.
          </li>
          <li>
            Harass, abuse, or discriminate against other users in sessions, messages, or
            group chats.
          </li>
          <li>
            Circumvent, disable, or interfere with security features, rate limits, or
            enrollment caps on Programs, Courses, or Internships.
          </li>
          <li>
            Use automated means (bots, scrapers) to access or interact with the Platform
            without our prior written consent.
          </li>
        </ul>
      </Section>

      <Section title="5. Sessions, Programs, and Certificates">
        <p>
          Users may offer or book sessions, enroll in Courses, or participate in
          Internships listed on the Platform ("Programs"). Enrollment in Programs may be
          subject to capacity limits. Certificates, badges, and tier promotions awarded
          through the Platform reflect participation and performance as tracked by
          ElevateHours and are not equivalent to accredited academic or professional
          credentials unless explicitly stated by the issuing Educator or Organization.
        </p>
      </Section>

      <Section title="6. Content and Conduct Between Users">
        <p>
          ElevateHours provides tools (including direct messages and group chat) to
          facilitate coordination between users. We do not control, and are not
          responsible for, the conduct of users toward one another, whether on or off the
          Platform. You interact with other users at your own risk and are encouraged to
          report any violations of these Terms through the Platform's reporting features.
        </p>
      </Section>

      <Section title="7. Account Suspension and Termination">
        <p>
          We reserve the right to suspend or terminate your account, with or without
          notice, if we believe you have violated these Terms, engaged in fraudulent or
          abusive behavior, or posed a risk to other users or the Platform. Sparks balances
          are not refundable or convertible upon suspension or termination.
        </p>
      </Section>

      <Section title="8. Intellectual Property">
        <p>
          The ElevateHours name, logo, design, and Platform content (excluding
          user-submitted content) are the property of CodeScriptors IT Solutions. You
          retain ownership of content you submit but grant ElevateHours a non-exclusive,
          worldwide, royalty-free license to host, display, and distribute that content as
          necessary to operate the Platform.
        </p>
      </Section>

      <Section title="9. Disclaimers">
        <p>
          ElevateHours is provided "as is" and "as available" without warranties of any
          kind, express or implied. We do not guarantee the accuracy, quality, or
          reliability of any skill, service, or content exchanged between users. We are
          not responsible for the outcome of any session, Program, or transaction between
          users.
        </p>
      </Section>

      <Section title="10. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, CodeScriptors IT Solutions and
          ElevateHours shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages arising from your use of the Platform,
          including loss of Sparks, data, or opportunities.
        </p>
      </Section>

      <Section title="11. Changes to These Terms">
        <p>
          We may update these Terms from time to time. Material changes will be
          communicated through the Platform (e.g., via a site-wide announcement). Continued
          use of the Platform after changes take effect constitutes acceptance of the
          updated Terms.
        </p>
      </Section>

      <Section title="12. Governing Law">
        <p>
          These Terms are governed by the laws of Bangladesh, without regard to conflict
          of law principles, unless otherwise required by applicable local law.
        </p>
      </Section>

      <Section title="13. Contact">
        <p>
          Questions about these Terms can be directed to CodeScriptors IT Solutions
          through the contact details provided on the Platform.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}
