export const metadata = {
  title: "Privacy Policy | ElevateHours",
  description: "Privacy Policy for ElevateHours — the skill-based time-barter marketplace.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-foreground">
      <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: August 4, 2026</p>

      <p className="mb-6">
        This Privacy Policy explains how ElevateHours ("ElevateHours," "we," "us," or
        "our"), operated by CodeScriptors IT Solutions, collects, uses, and protects your
        information when you use our website, applications, and services (the
        "Platform").
      </p>

      <Section title="1. Information We Collect">
        <p>We collect the following types of information:</p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>
            <span className="font-medium text-foreground">Account information:</span>{" "}
            name, email address, password (hashed), account type (Personal, Educator,
            Organization/NGO), and profile details you choose to add (skills, bio, photo,
            portfolio links).
          </li>
          <li>
            <span className="font-medium text-foreground">Transaction data:</span> Sparks
            balances, purchase history, session bookings, gifts, referral activity, and
            Program (Course/Internship) enrollments.
          </li>
          <li>
            <span className="font-medium text-foreground">Communications:</span> direct
            messages and group chat content sent through the Platform.
          </li>
          <li>
            <span className="font-medium text-foreground">Usage data:</span> activity
            streaks, tier progress, pages visited, and general interaction data used to
            operate features like the activity heatmap and admin analytics.
          </li>
          <li>
            <span className="font-medium text-foreground">Location data:</span> your
            registered country, used solely for dual pricing on Sparks purchases (subject
            to the 60-day change cooldown).
          </li>
          <li>
            <span className="font-medium text-foreground">Technical data:</span> IP
            address, browser type, and device information collected automatically for
            security and performance purposes.
          </li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>To create and manage your account and provide the Platform's features.</li>
          <li>
            To process Sparks transactions, enforce pricing rules, and maintain accurate
            balances.
          </li>
          <li>
            To facilitate communication between users (direct messages, group chat,
            session coordination).
          </li>
          <li>
            To operate gamification features such as streaks, tiers, badges, and
            certificates.
          </li>
          <li>To detect, investigate, and prevent fraud, abuse, or violations of our Terms of Service.</li>
          <li>To send you service-related notifications and, where applicable, announcements.</li>
          <li>To improve the Platform through aggregated, non-identifying analysis of usage patterns.</li>
        </ul>
      </Section>

      <Section title="3. How We Share Your Information">
        <p>We do not sell your personal information. We may share information:</p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>
            <span className="font-medium text-foreground">With other users:</span> your
            public profile, skills, ratings, and relevant activity are visible to other
            users as part of the Platform's core functionality.
          </li>
          <li>
            <span className="font-medium text-foreground">With service providers:</span>{" "}
            such as our hosting provider (Vercel) and database provider (Supabase), who
            process data on our behalf under appropriate confidentiality obligations.
          </li>
          <li>
            <span className="font-medium text-foreground">For legal reasons:</span> if
            required by law, regulation, legal process, or governmental request, or to
            protect the rights, property, or safety of ElevateHours, our users, or others.
          </li>
        </ul>
      </Section>

      <Section title="4. Data Storage and Security">
        <p>
          Your data is stored using Supabase's infrastructure. We apply reasonable
          technical and organizational measures, including Row Level Security policies, to
          protect your information from unauthorized access, alteration, or disclosure.
          However, no method of transmission or storage is 100% secure, and we cannot
          guarantee absolute security.
        </p>
      </Section>

      <Section title="5. Data Retention">
        <p>
          We retain your account and transaction information for as long as your account
          is active or as needed to provide the Platform, comply with legal obligations,
          resolve disputes, and enforce our agreements. You may request deletion of your
          account as described in Section 7.
        </p>
      </Section>

      <Section title="6. Cookies and Similar Technologies">
        <p>
          We use cookies and similar technologies to keep you logged in, remember your
          theme preference (dark/light mode), and understand how the Platform is used. You
          can control cookies through your browser settings, though disabling them may
          affect Platform functionality.
        </p>
      </Section>

      <Section title="7. Your Rights and Choices">
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>You may access and update most of your account information directly through your profile settings.</li>
          <li>
            You may request a copy of your personal data or request that we delete your
            account and associated data, subject to legal and operational retention
            requirements (e.g., transaction records).
          </li>
          <li>
            You may opt out of non-essential notifications and announcements through your
            account settings, where available.
          </li>
        </ul>
        <p className="mt-3">
          To exercise these rights, contact us using the details in Section 10.
        </p>
      </Section>

      <Section title="8. Children's Privacy">
        <p>
          ElevateHours is not intended for use by individuals under 16 years of age. We do
          not knowingly collect personal information from children under 16. If we become
          aware that we have collected such information, we will take steps to delete it.
        </p>
      </Section>

      <Section title="9. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be
          communicated through the Platform (e.g., via a site-wide announcement). Continued
          use of the Platform after changes take effect constitutes acceptance of the
          updated Policy.
        </p>
      </Section>

      <Section title="10. Contact Us">
        <p>
          Questions about this Privacy Policy can be directed to CodeScriptors IT
          Solutions through the contact details provided on the Platform.
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
