
import React from 'react';
import { Smartphone, Mail, Trash2, Database, FileArchive, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DeleteAccountInfo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-buddy-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-buddy-900">
            Delete your BuddyBetes account
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            How to request deletion of your BuddyBetes account and what happens to
            your data. This page is provided for the BuddyBetes app published by
            BuddyBetes on Google Play.
          </p>
        </header>

        {/* Steps */}
        <section className="space-y-4 mb-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-primary" />
            How to delete your account
          </h2>

          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-gray-900">Option 1 — In the app</h3>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base text-gray-700">
              <li>Sign in to BuddyBetes.</li>
              <li>Go to <span className="font-medium">Profile → Settings → Privacy &amp; Security</span>.</li>
              <li>Tap <span className="font-medium">Delete My Account</span> and confirm.</li>
            </ol>
            <p className="mt-3 text-sm text-gray-600">
              Deletion takes effect immediately and is permanent. You will receive a
              confirmation email once it is complete.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-gray-900">Option 2 — By email</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              If you cannot sign in, email{' '}
              <a
                href="mailto:support@buddybetes.com?subject=Account%20Deletion%20Request"
                className="text-primary underline font-medium"
              >
                support@buddybetes.com
              </a>{' '}
              with the subject <span className="font-medium">"Account Deletion Request"</span>,
              using the email address registered to your account.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              We process email requests within 7 days and send a confirmation once
              your account and data have been deleted.
            </p>
          </div>
        </section>

        {/* Data deleted */}
        <section className="mb-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-primary" />
            Data that is deleted
          </h2>
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-700">
              <li>Your profile: name, email address, and account details</li>
              <li>Your health profile: diabetes type, birthdate, height, and weight</li>
              <li>All glucose logs, including meal context, nutrition, medication, exercise, and notes</li>
              <li>Your AI assistant conversations and message history</li>
              <li>Event registrations and check-in QR codes</li>
              <li>Notifications and subscription/payment receipt records held in the app</li>
              <li>Session and activity logs</li>
              <li>Your email subscription and communication preferences</li>
            </ul>
          </div>
        </section>

        {/* Data kept */}
        <section className="mb-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <FileArchive className="h-5 w-5 text-primary" />
            Data that is kept
          </h2>
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 space-y-3 text-sm sm:text-base text-gray-700">
            <ul className="list-disc list-inside space-y-2">
              <li>
                Anonymized, aggregated usage statistics (for example, total daily active
                users) that can no longer be linked to you in any way
              </li>
              <li>
                Records that payment providers are legally required to retain under their
                own policies, outside of BuddyBetes
              </li>
            </ul>
          </div>
        </section>

        {/* Retention */}
        <section className="mb-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-primary" />
            Retention periods
          </h2>
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 space-y-3 text-sm sm:text-base text-gray-700">
            <p>
              <span className="font-medium">Account data:</span> deleted immediately when
              you confirm deletion in the app, or when your email request is processed.
            </p>
            <p>
              <span className="font-medium">Backups:</span> remaining copies in encrypted
              backups are purged within 30 days.
            </p>
            <p>
              <span className="font-medium">Anonymized statistics:</span> retained
              indefinitely, since they contain no personal data.
            </p>
            <p>
              <span className="font-medium">Payment processor records:</span> retained as
              required by law under the payment provider's own retention policy.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="text-center border-t pt-8">
          <p className="text-sm text-gray-600 mb-4">
            Questions about account deletion or your data?
          </p>
          <a href="mailto:support@buddybetes.com">
            <Button variant="outline" className="text-primary border-primary">
              support@buddybetes.com
            </Button>
          </a>
          <p className="mt-6 text-xs text-gray-500">
            BuddyBetes — Your diabetes management companion 💙 ·{' '}
            <a href="/terms" className="underline">Terms of Service</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default DeleteAccountInfo;
