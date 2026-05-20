export const dynamic = 'force-dynamic';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Labs - Privacy Policy',
  description: 'Privacy Policy for Labs',
};

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-white">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none">
        <p className="mb-4">At Labs, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information.</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
        <p className="mb-4">We collect information that you provide directly to us, such as when you create an account, update your profile, or use our services.</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">We use the information we collect to provide, maintain, and improve our services, as well as to communicate with you.</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">3. Data Security</h2>
        <p className="mb-4">We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or destruction.</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">4. Third-Party Services</h2>
        <p className="mb-4">We may use third-party services that collect, monitor, and analyze data to help us improve our services.</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">5. Contact Us</h2>
        <p className="mb-4">If you have any questions about this Privacy Policy, please contact us.</p>
      </div>
    </div>
  );
}
