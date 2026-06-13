import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Footer } from "@/components/landing/Footer";

function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  children,
}: {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  const location = useLocation();
  const legalLinks = [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms & Conditions", to: "/terms" },
    { label: "Fees Policy", to: "/policy/fees" },
    { label: "Admissions Policy", to: "/policy/admissions" },
    { label: "Child Protection Policy", to: "/policy/child-protection" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A08] text-white">
      <div className="border-b border-white/[0.07] bg-[#0F0F0D] px-6 pb-14 pt-32 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center gap-2 text-[11px] text-white/30">
            <Link to="/" className="transition-colors hover:text-white/60">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/40">Legal</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/50">{title}</span>
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-semibold tracking-[0.15em] text-white/50">
              LEGAL DOCUMENT
            </span>
          </div>

          <h1 className="mt-4 text-[42px] font-bold leading-[1.05] tracking-[-0.04em] text-white md:text-[52px]">
            {title}
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-white/45">{subtitle}</p>
          <p className="mt-6 text-[12px] text-white/25">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-3xl space-y-12">{children}</div>
      </div>

      <div className="border-t border-white/[0.07] px-6 py-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-5 text-[12px] text-white/30">Other legal documents</p>
          <div className="flex flex-wrap gap-2">
            {legalLinks.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full border px-4 py-2 text-[12px] transition-colors ${
                    isActive
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-white/10 bg-white/[0.04] text-white/50 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.02em] text-white">
        {title}
      </h2>
      <div className="space-y-3 text-[14px] leading-[1.85] text-white/55">{children}</div>
    </section>
  );
}

function Li({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" />
      <span>{children}</span>
    </li>
  );
}

export function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How Taawa Education collects, uses, and protects your personal information."
      lastUpdated="1 June 2026"
    >
      <Section title="1. Who We Are">
        <p>
          Taawa Education Ltd ("Taawa", "we", "us", or "our") is a homeschooling and
          private tutoring platform operating in Kenya and the United Kingdom. Our
          registered offices are at Malik Heights, 6th Floor, Ngong Road, Nairobi,
          Kenya, and 128 City Road, London, EC1V 2NX, United Kingdom.
        </p>
        <p>
          We are committed to protecting the personal data of parents, students,
          tutors, and visitors who interact with our platform, website, and services.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p>We collect the following categories of personal data:</p>
        <ul className="mt-2 space-y-2">
          <Li>
            <strong className="text-white/80">Account data:</strong> Name, email
            address, phone number, and password when you register.
          </Li>
          <Li>
            <strong className="text-white/80">Child information:</strong> First
            name, age, grade level, learning needs, and curriculum preferences
            provided by a parent or guardian.
          </Li>
          <Li>
            <strong className="text-white/80">Tutor data:</strong> Professional
            qualifications, subject expertise, ID verification, bank details for
            payment, and session history.
          </Li>
          <Li>
            <strong className="text-white/80">Payment data:</strong> Billing
            address and transaction records. Card details are processed by our
            payment provider (M-Pesa / Stripe) and never stored by us.
          </Li>
          <Li>
            <strong className="text-white/80">Usage data:</strong> Pages visited,
            session duration, device type, and IP address collected via cookies and
            analytics tools.
          </Li>
          <Li>
            <strong className="text-white/80">Communications:</strong> Messages sent
            via our platform, contact forms, and email correspondence.
          </Li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>We use your personal data to:</p>
        <ul className="mt-2 space-y-2">
          <Li>Create and manage your account and deliver our tutoring services.</Li>
          <Li>
            Match students with appropriate tutors based on curriculum, subject, and
            learning needs.
          </Li>
          <Li>Process payments and issue receipts and invoices.</Li>
          <Li>Send session reminders, progress reports, and service notifications.</Li>
          <Li>Respond to enquiries and provide customer support.</Li>
          <Li>Improve our platform through anonymised analytics and user feedback.</Li>
          <Li>Comply with our legal obligations in Kenya and the United Kingdom.</Li>
        </ul>
      </Section>

      <Section title="4. Children's Privacy">
        <p>
          We take the privacy of children extremely seriously. We only collect data
          about children through their parent or guardian. We do not knowingly
          collect personal data directly from children under the age of 18 without
          verified parental consent.
        </p>
        <p>
          Child data is used solely for the purpose of delivering educational
          services and is never shared with third parties for marketing or
          commercial purposes.
        </p>
      </Section>

      <Section title="5. Data Sharing">
        <p>We do not sell your personal data. We may share data with:</p>
        <ul className="mt-2 space-y-2">
          <Li>
            <strong className="text-white/80">Tutors:</strong> We share relevant
            student information (name, grade, subject needs) with matched tutors to
            deliver sessions.
          </Li>
          <Li>
            <strong className="text-white/80">Payment processors:</strong> M-Pesa
            (Safaricom) and Stripe for transaction processing.
          </Li>
          <Li>
            <strong className="text-white/80">Cloud providers:</strong> Supabase
            for secure data storage, hosted on AWS infrastructure.
          </Li>
          <Li>
            <strong className="text-white/80">Legal authorities:</strong> Where
            required by Kenyan or UK law, court order, or to protect the safety of a
            child.
          </Li>
        </ul>
      </Section>

      <Section title="6. Data Retention">
        <p>
          We retain personal data for as long as your account is active or as needed
          to provide services. Upon account closure, we delete personal data within
          90 days, except where retention is required by law (for example, financial
          records retained for 7 years).
        </p>
      </Section>

      <Section title="7. Your Rights">
        <p>You have the right to:</p>
        <ul className="mt-2 space-y-2">
          <Li>Access the personal data we hold about you.</Li>
          <Li>Request correction of inaccurate data.</Li>
          <Li>Request deletion of your data.</Li>
          <Li>Withdraw consent at any time where processing is based on consent.</Li>
          <Li>
            Lodge a complaint with the Office of the Data Protection Commissioner
            (Kenya) or the ICO (UK).
          </Li>
        </ul>
        <p className="mt-3">
          To exercise your rights, contact us at{" "}
          <strong className="text-white/80">privacy@taawa.co.ke</strong>.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          We use essential cookies to keep you logged in and functional cookies to
          remember your preferences. We use analytics cookies to understand how our
          platform is used. You can disable non-essential cookies in your browser
          settings at any time.
        </p>
      </Section>

      <Section title="9. Security">
        <p>
          We implement industry-standard security measures including TLS encryption
          in transit, encrypted storage at rest, access controls, and regular
          security audits. No system is 100% secure, and we encourage you to use a
          strong, unique password for your Taawa account.
        </p>
      </Section>

      <Section title="10. Contact Us">
        <p>
          For any privacy-related questions or requests, contact our Data Protection
          Officer at <strong className="text-white/80">privacy@taawa.co.ke</strong>{" "}
          or by post to Malik Heights, 6th Floor, Ngong Road, Nairobi, Kenya.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="The rules and obligations that govern your use of Taawa Education's platform and services."
      lastUpdated="1 June 2026"
    >
      <Section title="1. Acceptance of Terms">
        <p>
          By accessing or using Taawa Education's platform, website, or services,
          you agree to be bound by these Terms and Conditions. If you do not agree,
          you may not use our services. These terms apply to all users including
          parents, guardians, students, and tutors.
        </p>
      </Section>

      <Section title="2. Our Services">
        <p>
          Taawa Education provides a platform connecting families with qualified
          private tutors and structured homeschooling programs. Our services include
          tutor matching, session scheduling, progress reporting, and curriculum
          planning support.
        </p>
        <p>
          We act as an intermediary between parents and tutors. Individual tutors
          are independent professionals and are not employees of Taawa Education
          unless explicitly stated.
        </p>
      </Section>

      <Section title="3. Account Registration">
        <ul className="space-y-2">
          <Li>
            You must be at least 18 years old to create an account. Parent or
            guardian accounts are required for student access.
          </Li>
          <Li>
            You are responsible for maintaining the confidentiality of your login
            credentials.
          </Li>
          <Li>
            You agree to provide accurate, current, and complete information during
            registration.
          </Li>
          <Li>
            Taawa Education reserves the right to suspend or terminate accounts that
            violate these terms.
          </Li>
        </ul>
      </Section>

      <Section title="4. Tutor Standards">
        <p>All tutors on the Taawa platform are required to:</p>
        <ul className="mt-2 space-y-2">
          <Li>Provide verified qualifications and relevant experience.</Li>
          <Li>Undergo identity verification and background screening where required.</Li>
          <Li>Adhere to our Child Protection Policy at all times.</Li>
          <Li>Deliver sessions professionally and to the agreed standard.</Li>
          <Li>Maintain confidentiality regarding student information.</Li>
        </ul>
      </Section>

      <Section title="5. Payments and Refunds">
        <p>
          Fees are charged in advance per session or per month as per the agreed
          plan. Payment is processed via M-Pesa or card through our secure payment
          provider.
        </p>
        <ul className="mt-2 space-y-2">
          <Li>
            Sessions cancelled by the parent with less than 24 hours' notice are
            non-refundable.
          </Li>
          <Li>Sessions cancelled by the tutor will be rescheduled or refunded in full.</Li>
          <Li>
            Monthly plans are non-refundable after the first session of each month
            has been delivered.
          </Li>
          <Li>Disputed charges must be raised within 7 days of the transaction date.</Li>
        </ul>
      </Section>

      <Section title="6. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="mt-2 space-y-2">
          <Li>Use the platform for any unlawful or harmful purpose.</Li>
          <Li>Harass, threaten, or abuse any tutor, student, or staff member.</Li>
          <Li>
            Attempt to circumvent Taawa's matching process by contacting tutors
            outside the platform to avoid fees.
          </Li>
          <Li>Share login credentials or allow unauthorised access to your account.</Li>
          <Li>
            Upload or transmit any content that is defamatory, obscene, or harmful
            to children.
          </Li>
        </ul>
      </Section>

      <Section title="7. Intellectual Property">
        <p>
          All content on the Taawa platform including lesson plans, curriculum
          guides, reports, branding, and website content is the intellectual
          property of Taawa Education Ltd. You may not copy, redistribute, or
          commercialise any content without prior written permission.
        </p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, Taawa Education shall not be
          liable for any indirect, incidental, or consequential damages arising from
          use of our services. Our total liability to you shall not exceed the
          amount paid by you in the 3 months preceding the claim.
        </p>
      </Section>

      <Section title="9. Governing Law">
        <p>
          These Terms are governed by the laws of Kenya. Any disputes shall be
          subject to the exclusive jurisdiction of the courts of Nairobi, Kenya. For
          UK-based users, UK consumer protection laws apply in addition to these
          terms.
        </p>
      </Section>

      <Section title="10. Changes to These Terms">
        <p>
          We may update these Terms from time to time. We will notify registered
          users of material changes via email at least 14 days before they take
          effect. Continued use of the platform after changes constitutes acceptance
          of the revised terms.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          For questions about these Terms, contact us at{" "}
          <strong className="text-white/80">legal@taawa.co.ke</strong>.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function FeesPolicyPage() {
  return (
    <LegalLayout
      title="Fees Policy"
      subtitle="A clear breakdown of how fees are structured, charged, and managed across all Taawa programs."
      lastUpdated="1 June 2026"
    >
      <Section title="1. Fee Structure">
        <p>
          Taawa Education charges fees based on program type and session frequency.
          Our current rates are:
        </p>
        <div className="mt-4 overflow-hidden rounded-[14px] border border-white/8">
          {[
            ["CBC Curriculum", "KES 40,000 / month", "KES 2,000 per 2-hr session"],
            ["British / IGCSE", "KES 50,000 / month", "KES 2,500 per 2-hr session"],
            ["Montessori", "KES 30,000 / month", "KES 1,500 per 2-hr session"],
            ["Custom Learning Plan", "KES 45,000 / month", "KES 2,000 per 2-hr session"],
          ].map(([program, monthly, perSession], i) => (
            <div
              key={program}
              className={`grid grid-cols-3 gap-4 px-5 py-4 text-[13px] ${
                i < 3 ? "border-b border-white/[0.06]" : ""
              } ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
            >
              <span className="font-medium text-white/80">{program}</span>
              <span className="text-white/50">{monthly}</span>
              <span className="text-white/40">{perSession}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-white/30">
          All fees are quoted in Kenyan Shillings (KES) inclusive of VAT where
          applicable. UK clients are billed in GBP at the prevailing exchange rate.
        </p>
      </Section>

      <Section title="2. Payment Methods">
        <ul className="space-y-2">
          <Li>M-Pesa (Paybill and Till) - primary method for Kenya-based families.</Li>
          <Li>Visa / Mastercard via Stripe - available for all clients.</Li>
          <Li>Bank transfer - available on request for monthly plans.</Li>
          <Li>UK bank transfer (GBP) - for UK-based clients via our London office.</Li>
        </ul>
      </Section>

      <Section title="3. Payment Timing">
        <p>
          Monthly plans are invoiced on the 1st of each month and due within 5
          working days. Per-session fees are charged 24 hours before the scheduled
          session. Failure to pay within the due period may result in sessions being
          paused until the outstanding balance is cleared.
        </p>
      </Section>

      <Section title="4. Cancellation and Refunds">
        <ul className="space-y-2">
          <Li>
            <strong className="text-white/80">Parent cancellation (24+ hours notice):</strong>{" "}
            Full credit applied to next session or month.
          </Li>
          <Li>
            <strong className="text-white/80">Parent cancellation (less than 24 hours):</strong>{" "}
            Session fee forfeited. No refund or credit.
          </Li>
          <Li>
            <strong className="text-white/80">Tutor cancellation:</strong> Full
            refund or rescheduled session at no extra charge.
          </Li>
          <Li>
            <strong className="text-white/80">Monthly plan cancellation:</strong>{" "}
            Must be submitted in writing by the 25th of the month to avoid charges
            for the following month.
          </Li>
          <Li>
            <strong className="text-white/80">Mid-month cancellations:</strong> No
            refund for sessions already delivered. Unused sessions may be credited
            at our discretion.
          </Li>
        </ul>
      </Section>

      <Section title="5. Late Payments">
        <p>
          Accounts with overdue balances of more than 7 days will have sessions
          suspended. A late payment notice will be sent after 3 days. Persistent
          non-payment may result in account termination and referral to a debt
          collection process.
        </p>
      </Section>

      <Section title="6. Price Changes">
        <p>
          Taawa Education reserves the right to revise fees with a minimum of 30
          days' written notice to existing clients. New rates will take effect at
          the start of the next billing month following the notice period.
        </p>
      </Section>

      <Section title="7. Sibling Discounts">
        <p>
          Families enrolling two or more children receive a 10% discount on the
          second child's monthly fee and 15% on the third and beyond. Discounts
          apply to the lower-priced program where programs differ.
        </p>
      </Section>

      <Section title="8. Queries and Disputes">
        <p>
          Fee queries must be raised within 7 days of the invoice date. Contact our
          billing team at <strong className="text-white/80">billing@taawa.co.ke</strong>{" "}
          or <strong className="text-white/80">+254 704 007 008</strong>.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function AdmissionsPolicyPage() {
  return (
    <LegalLayout
      title="Admissions Policy"
      subtitle="How Taawa Education assesses, accepts, and onboards new students and families."
      lastUpdated="1 June 2026"
    >
      <Section title="1. Our Commitment">
        <p>
          Taawa Education is committed to providing every child with access to
          high-quality, personalised homeschool education. We welcome students of
          all backgrounds, learning abilities, and academic levels. Admissions
          decisions are made solely on the basis of the child's educational needs
          and our ability to meet them.
        </p>
      </Section>

      <Section title="2. Who Can Apply">
        <p>We accept applications for:</p>
        <ul className="mt-2 space-y-2">
          <Li>Children aged 2-18 across all curriculum pathways.</Li>
          <Li>Students transitioning from mainstream schools to homeschooling.</Li>
          <Li>Students requiring supplementary tutoring alongside mainstream school.</Li>
          <Li>
            Students with special educational needs (SEN), twice-exceptional
            learners, or those with medical conditions preventing school attendance.
          </Li>
          <Li>
            Families relocating internationally who require curriculum continuity.
          </Li>
        </ul>
      </Section>

      <Section title="3. Application Process">
        <p>Our admissions process consists of four steps:</p>
        <div className="mt-4 space-y-3">
          {[
            [
              "Step 1 - Enquiry",
              "Complete our online enquiry form or contact us directly. We respond within 1 working day.",
            ],
            [
              "Step 2 - Consultation",
              "A free 30-minute call with our admissions team to understand your child's needs, goals, and preferred curriculum.",
            ],
            [
              "Step 3 - Assessment",
              "Where appropriate, a brief informal academic assessment is conducted to identify the right starting point. This is not a pass/fail test.",
            ],
            [
              "Step 4 - Tutor Matching",
              "We match your child with the most suitable available tutor. You meet the tutor before sessions begin. If the fit is not right, we rematch at no extra cost.",
            ],
          ].map(([stepTitle, body]) => (
            <div
              key={stepTitle}
              className="rounded-[12px] border border-white/7 bg-white/[0.03] p-4"
            >
              <p className="mb-1 text-[13px] font-semibold text-white/80">
                {stepTitle}
              </p>
              <p className="text-[13px] text-white/45">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="4. Required Information">
        <p>At enrolment, parents or guardians are asked to provide:</p>
        <ul className="mt-2 space-y-2">
          <Li>Child's full name, date of birth, and nationality.</Li>
          <Li>Most recent school reports or academic records where available.</Li>
          <Li>Any educational psychologist assessments or SEN documentation.</Li>
          <Li>Details of any medical conditions relevant to learning.</Li>
          <Li>Emergency contact information.</Li>
        </ul>
      </Section>

      <Section title="5. Students with Special Educational Needs">
        <p>
          We welcome students with a wide range of learning needs including
          dyslexia, ADHD, autism spectrum conditions, dyscalculia, and physical
          disabilities. Our admissions team will conduct an extended needs
          assessment and match the student with a tutor experienced in SEN
          delivery. Additional planning time may be required, which may affect
          session pricing.
        </p>
      </Section>

      <Section title="6. Waiting List">
        <p>
          If a suitable tutor is not immediately available, families are placed on a
          waiting list. We aim to resolve wait times within 2 weeks. You will be
          contacted as soon as a match is found.
        </p>
      </Section>

      <Section title="7. Trial Period">
        <p>
          All new students begin with a 4-session trial period. At the end of the
          trial, both the family and the tutor provide feedback. If either party is
          not satisfied, we offer a free rematch with an alternative tutor. The
          trial period is charged at standard rates.
        </p>
      </Section>

      <Section title="8. Termination of Enrolment">
        <p>
          Taawa Education reserves the right to terminate a student's enrolment in
          cases of persistent non-payment, abusive behaviour toward tutors or staff,
          or serious breach of our Child Protection Policy. Families will be given
          written notice and a right to respond before any termination decision is
          made.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>
          For admissions enquiries, contact{" "}
          <strong className="text-white/80">admissions@taawa.co.ke</strong> or call{" "}
          <strong className="text-white/80">+254 704 007 008</strong>.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function ChildProtectionPolicyPage() {
  return (
    <LegalLayout
      title="Child Protection Policy"
      subtitle="Taawa Education's commitment to safeguarding the welfare of every child in our care."
      lastUpdated="1 June 2026"
    >
      <div className="rounded-[14px] border border-primary/20 bg-primary/[0.07] p-5">
        <p className="text-[13px] leading-relaxed text-white/70">
          <strong className="text-primary">Important:</strong> If you have an
          immediate concern about the safety of a child, contact the Kenya
          Children's Hotline on <strong className="text-white/90">116</strong>{" "}
          (free, 24/7) or the NSPCC (UK) on{" "}
          <strong className="text-white/90">0808 800 5000</strong>. Do not wait.
        </p>
      </div>

      <Section title="1. Our Commitment">
        <p>
          Taawa Education is unconditionally committed to the safety and welfare of
          every child who uses our platform. The protection of children is the
          primary responsibility of every person associated with Taawa, including
          staff, tutors, administrators, and contractors.
        </p>
        <p>
          We follow the Kenya Children Act 2022 and the UK Children Act 1989 and
          2004, and align our practices with internationally recognised safeguarding
          standards.
        </p>
      </Section>

      <Section title="2. Scope">
        <p>This policy applies to:</p>
        <ul className="mt-2 space-y-2">
          <Li>All children (persons under 18) enrolled on any Taawa program.</Li>
          <Li>
            All Taawa staff, tutors, contractors, and volunteers who interact with
            children.
          </Li>
          <Li>All online and in-person sessions delivered under the Taawa brand.</Li>
        </ul>
      </Section>

      <Section title="3. Tutor Vetting">
        <p>Before any tutor is permitted to teach on our platform, they must:</p>
        <ul className="mt-2 space-y-2">
          <Li>Provide a valid national ID or passport for identity verification.</Li>
          <Li>
            Undergo a Directorate of Criminal Investigations (DCI) clearance check
            in Kenya or a Disclosure and Barring Service (DBS) check in the UK.
          </Li>
          <Li>
            Provide at least two professional references, at least one of which
            relates to work with children.
          </Li>
          <Li>
            Complete Taawa's mandatory safeguarding induction training before their
            first session.
          </Li>
          <Li>Sign and adhere to our Tutor Code of Conduct.</Li>
        </ul>
      </Section>

      <Section title="4. Safe Session Standards">
        <p>All sessions on the Taawa platform must follow these standards:</p>
        <ul className="mt-2 space-y-2">
          <Li>
            Online sessions must be conducted on Taawa's approved video platform.
            Screen recording by tutors is strictly prohibited.
          </Li>
          <Li>
            In-person sessions must take place in a shared, observable space and
            never in a child's bedroom or private space without a parent present.
          </Li>
          <Li>
            Tutors must not communicate with students outside the Taawa platform
            unless a parent is included in the communication.
          </Li>
          <Li>
            Tutors must not request or accept personal contact details directly from
            students.
          </Li>
          <Li>
            Any deviation from these standards must be immediately reported to
            Taawa's Designated Safeguarding Lead (DSL).
          </Li>
        </ul>
      </Section>

      <Section title="5. Recognising Abuse">
        <p>All tutors and staff are trained to recognise signs of:</p>
        <ul className="mt-2 space-y-2">
          <Li>
            <strong className="text-white/80">Physical abuse:</strong> Unexplained
            injuries, flinching, reluctance to go home.
          </Li>
          <Li>
            <strong className="text-white/80">Emotional abuse:</strong> Low
            self-esteem, withdrawal, excessive anxiety or aggression.
          </Li>
          <Li>
            <strong className="text-white/80">Neglect:</strong> Poor hygiene,
            hunger, frequent absences, inadequate clothing.
          </Li>
          <Li>
            <strong className="text-white/80">Sexual abuse:</strong>
            Age-inappropriate sexual knowledge, self-harm, sudden behavioural
            change.
          </Li>
          <Li>
            <strong className="text-white/80">Online abuse:</strong> Distress after
            device use, secrecy about online activity.
          </Li>
        </ul>
      </Section>

      <Section title="6. Reporting Obligations">
        <p>
          Any tutor, staff member, or contractor who has a concern about a child's
          welfare must report it to Taawa's Designated Safeguarding Lead (DSL)
          immediately and no later than 24 hours after the concern arises.
        </p>
        <p>
          The DSL will assess the concern and, where appropriate, make a report to
          the relevant statutory authority. We do not investigate allegations
          ourselves - that is the role of statutory authorities.
        </p>
        <p>
          Staff and tutors who report concerns in good faith will be fully supported
          by Taawa Education. Failure to report a known or suspected concern is a
          serious breach of this policy and may result in dismissal and referral to
          relevant authorities.
        </p>
      </Section>

      <Section title="7. Designated Safeguarding Lead">
        <p>
          Taawa's Designated Safeguarding Lead (DSL) is responsible for overseeing
          all child protection matters. The DSL can be contacted at{" "}
          <strong className="text-white/80">safeguarding@taawa.co.ke</strong> or{" "}
          <strong className="text-white/80">+254 704 007 008</strong>.
        </p>
        <p>
          In the UK, our safeguarding contact is reachable at{" "}
          <strong className="text-white/80">safeguarding@taawa.co.uk</strong> or{" "}
          <strong className="text-white/80">+44 (0) 203 907 7700</strong>.
        </p>
      </Section>

      <Section title="8. Confidentiality">
        <p>
          Information about safeguarding concerns is shared on a strictly
          need-to-know basis and only with those who need it to protect the child.
          We do not share information with parents or carers if doing so could put
          the child at greater risk. Confidentiality cannot be guaranteed where a
          child is at risk of harm.
        </p>
      </Section>

      <Section title="9. Policy Review">
        <p>
          This policy is reviewed annually by Taawa's leadership team and updated to
          reflect changes in legislation, best practice, or operational context. All
          tutors and staff are notified of material changes and required to confirm
          their understanding in writing.
        </p>
        <p>
          Next scheduled review: <strong className="text-white/70">June 2027</strong>.
        </p>
      </Section>
    </LegalLayout>
  );
}
