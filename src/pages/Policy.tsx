import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { POLICY_VERSION, acceptCurrentPolicy, clearPolicyAcceptance, getPolicyAcceptance, hasAcceptedCurrentPolicy } from '../constants/policy';

const Policy: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const target = searchParams.get('target');
  const acceptance = getPolicyAcceptance();
  const isAccepted = hasAcceptedCurrentPolicy();

  const handleBack = () => {
    if (returnTo) {
      navigate(returnTo);
      return;
    }

    navigate(-1);
  };

  const handleAgree = () => {
    acceptCurrentPolicy();

    if (target) {
      window.location.href = target;
      return;
    }

    navigate(returnTo || '/');
  };

  const handleCancel = () => {
    clearPolicyAcceptance();
    if (returnTo) {
      navigate(returnTo);
      return;
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border-l-4 border-l-indigo-600">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔁 LoopIt – Booking & Usage Policy
          </h1>
          <p className="text-gray-500">Policy version: {POLICY_VERSION}</p>
        </div>

        <div className={`rounded-lg p-5 mb-8 border ${isAccepted ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <p className="font-semibold text-gray-900 mb-1">
            {isAccepted ? 'Policy already accepted' : 'Policy review required'}
          </p>
          <p className="text-sm text-gray-700">
            {isAccepted
              ? `Accepted on ${acceptance ? new Date(acceptance.acceptedAt).toLocaleString() : 'this device'}.`
              : 'Please review the terms below before continuing with a booking or seller contact flow.'}
          </p>
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Platform Role</h2>
            <div className="text-gray-700 space-y-3">
              <p>LoopIt is a facilitator platform that connects buyers and sellers.</p>
              <p>LoopIt does not own or sell items listed on the platform, except during designated storage periods.</p>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Booking & Fees</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">To reserve an item, a booking amount is required.</p>
              
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Booking Amount Details:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>The booking amount varies depending on the item value</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>It includes a refundable portion and a fixed ₹100 LoopIt service fee (non-refundable)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How it Works:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>If buyer purchases the item:</strong> The full booking amount is adjusted in the final price</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>If buyer does not purchase:</strong> The refundable portion is returned, and ₹100 is retained as LoopIt's service fee</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Payments & Process</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-indigo-600 font-bold text-xl">1</span>
                <span>Seller details are shared only after booking is confirmed</span>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-600 font-bold text-xl">2</span>
                <span>Buyers must inspect the item before making final payment</span>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-600 font-bold text-xl">3</span>
                <span>Final payment is made directly to the seller at pickup</span>
              </li>
            </ul>
          </section>

          <hr className="border-gray-200" />

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Responsibility & Liability</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Regular Listings (No Storage)</h3>
                <div className="bg-red-50 p-4 rounded-lg text-gray-700 space-y-2 text-sm">
                  <p>• LoopIt is not responsible for item condition, quality, or functionality</p>
                  <p>• Buyers must verify items before purchase</p>
                  <p>• Sellers must provide accurate details</p>
                  <p>• LoopIt holds no liability after buyer-seller meetup</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Storage / Seasonal Mode</h3>
                <div className="bg-amber-50 p-4 rounded-lg text-gray-700 space-y-3 text-sm">
                  <p className="font-semibold">When items are stored and managed by LoopIt, we take limited responsibility for:</p>
                  <p>• Basic item condition verification</p>
                  <p>• Accuracy of listing details</p>
                  <p className="font-semibold text-gray-900 pt-2">However, LoopIt does not provide warranty or guarantee long-term performance</p>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Conduct</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">Users agree to:</p>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
                <p>• Provide honest and accurate information</p>
                <p>• Avoid fake listings or misleading details</p>
                <p>• Not cancel after confirming without valid reason</p>
                <p>• Not bypass LoopIt after booking</p>
              </div>
              <p className="text-red-600 font-semibold">Failure to comply may result in removal from the platform.</p>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Seller Obligations</h2>
            <div className="bg-yellow-50 p-4 rounded-lg text-gray-700 space-y-2 text-sm">
              <p>• Sellers must be available once a buyer reserves an item</p>
              <p>• Items must match the description provided</p>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Acceptance of Terms</h2>
            <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-l-indigo-600">
              <p className="text-gray-700 font-semibold">
                By booking or using LoopIt, you acknowledge and agree to this policy.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mt-12 pt-8 border-t-2 border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Questions?</h2>
            <p className="text-gray-700">
              If you have any questions about this policy, please contact our support team at{' '}
              <a href="mailto:support@loopit.com" className="text-indigo-600 hover:underline font-semibold">
                support@loopit.com
              </a>
            </p>
          </section>

          <section className="pt-8 border-t-2 border-gray-200">
            <div className="bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Booking Agreement</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Continue only if you agree to LoopIt&apos;s booking, payment, and usage terms.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAgree}
                  className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Agree & Continue
                </button>
              </div>
            </div>
            {!returnTo && !target && (
              <p className="text-sm text-gray-500 mt-4">
                Looking around? You can also go back to <Link to="/listings" className="text-indigo-600 hover:underline font-medium">the marketplace</Link>.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Policy;
