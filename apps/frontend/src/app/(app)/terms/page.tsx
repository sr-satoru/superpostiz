export const dynamic = 'force-dynamic';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Labs - Terms of Service',
  description: 'Terms of Service for Labs',
};

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-white">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-invert max-w-none">
        <p className="mb-4">Welcome to Labs. These Terms of Service govern your use of our platform and services.</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">By accessing or using our services, you agree to be bound by these Terms. If you do not agree, please do not use our services.</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">2. Use of Services</h2>
        <p className="mb-4">You agree to use our services only for lawful purposes and in accordance with these Terms.</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">3. Privacy</h2>
        <p className="mb-4">Your use of our services is also governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">4. Modifications</h2>
        <p className="mb-4">We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page.</p>
      </div>
    </div>
  );
}
