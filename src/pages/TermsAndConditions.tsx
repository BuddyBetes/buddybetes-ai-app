
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const TermsAndConditions = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8F8] p-4">
      <div className="mx-auto w-full max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Link to="/signup">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Terms and Conditions</h1>
          </div>
          
          <ScrollArea className="h-[70vh]">
            <div className="space-y-4 p-1">
              <p>Last Updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="text-xl font-medium mt-6">1. Introduction</h2>
              <p>Welcome to BuddyBetes. These Terms and Conditions govern your use of our application and services. By using BuddyBetes, you agree to these terms in full. If you disagree with these terms, you must not use our application.</p>
              
              <h2 className="text-xl font-medium mt-6">2. Definitions</h2>
              <p>"BuddyBetes" refers to our application, website, and services.<br />
              "User", "You", and "Your" refers to you, the person accessing BuddyBetes.<br />
              "We", "Us", and "Our" refers to the owners of BuddyBetes.<br />
              "Party", "Parties", or "Us" refers to both you and ourselves.</p>
              
              <h2 className="text-xl font-medium mt-6">3. Health Disclaimer</h2>
              <p>BuddyBetes is designed to help track and manage diabetes, but it is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
              
              <h2 className="text-xl font-medium mt-6">4. User Accounts</h2>
              <p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
              
              <h2 className="text-xl font-medium mt-6">5. User Content</h2>
              <p>You retain all rights to the health data and other content you submit to BuddyBetes. By submitting content, you grant us a worldwide, royalty-free license to use, reproduce, modify, and distribute your content solely for the purpose of providing our services.</p>
              
              <h2 className="text-xl font-medium mt-6">6. Privacy Policy</h2>
              <p>Our Privacy Policy explains how we collect, use, and protect your personal information. By using BuddyBetes, you consent to the data practices described in our Privacy Policy.</p>
              
              <h2 className="text-xl font-medium mt-6">7. Intellectual Property</h2>
              <p>BuddyBetes and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
              
              <h2 className="text-xl font-medium mt-6">8. Termination</h2>
              <p>We may terminate or suspend your account and access to BuddyBetes immediately, without prior notice, for conduct that we believe violates these Terms and Conditions or is harmful to other users, us, or third parties, or for any other reason at our discretion.</p>
              
              <h2 className="text-xl font-medium mt-6">9. Limitation of Liability</h2>
              <p>In no event shall BuddyBetes, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
              
              <h2 className="text-xl font-medium mt-6">10. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. When we do, we will revise the updated date at the bottom of this page. We encourage you to frequently check this page for any changes.</p>
              
              <h2 className="text-xl font-medium mt-6">11. Contact Information</h2>
              <p>If you have any questions about these Terms and Conditions, please contact us at support@buddybetes.com.</p>
              
              <h2 className="text-xl font-medium mt-6">12. Data Storage and Security</h2>
              <p>We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential.</p>
              
              <h2 className="text-xl font-medium mt-6">13. Third-Party Links</h2>
              <p>BuddyBetes may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.</p>
              
              <h2 className="text-xl font-medium mt-6">14. Age Restrictions</h2>
              <p>BuddyBetes is not intended for individuals under the age of 13. If we learn that we have collected personal information from an individual under age 13, we will delete that information as quickly as possible.</p>
              
              <h2 className="text-xl font-medium mt-6">15. Governing Law</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.</p>
              
              <h2 className="text-xl font-medium mt-6">16. Dispute Resolution</h2>
              <p>Any dispute arising from or relating to the subject matter of this Agreement shall be finally settled by arbitration, using the English language, administered by the American Arbitration Association under its Commercial Arbitration Rules then in effect.</p>
              
              <h2 className="text-xl font-medium mt-6">17. Severability</h2>
              <p>If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.</p>
              
              <h2 className="text-xl font-medium mt-6">18. Waiver</h2>
              <p>No waiver of any term of this Agreement shall be deemed a further or continuing waiver of such term.</p>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
