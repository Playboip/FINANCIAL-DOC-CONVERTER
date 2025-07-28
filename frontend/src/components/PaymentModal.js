import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, Zap, Shield, Crown } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [timeLeft, setTimeLeft] = useState('');

  // Create urgency with countdown timer
  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay - now;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    };

    if (isOpen) {
      setTimeLeft(calculateTimeLeft());
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 60000); // Update every minute

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const plans = {
    free: {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '3 document conversions per day',
        '1 AI analysis per day',
        'Basic file formats (CSV, Excel)',
        'Email support'
      ],
      limitations: true
    },
    pro: {
      name: 'Pro',
      price: '$4.99',
      originalPrice: '$9.99',
      period: 'per month',
      features: [
        'Unlimited document conversions',
        '50 AI analyses per month',
        'All file formats (PDF, DOCX, etc.)',
        'Advanced AI insights',
        'Priority processing',
        'Email support'
      ],
      popular: true,
      stripeLink: 'https://buy.stripe.com/test_your_pro_link_here', // Replace with your actual link
      savings: 'Save $60/year'
    },
    business: {
      name: 'Business',
      price: '$14.99',
      originalPrice: '$29.99',
      period: 'per month',
      features: [
        'Everything in Pro',
        'Unlimited AI analyses',
        'Batch processing (multiple files)',
        'API access',
        'Custom analysis templates',
        'Priority phone support'
      ],
      stripeLink: 'https://buy.stripe.com/test_your_business_link_here', // Replace with your actual link
      savings: 'Save $180/year'
    }
  };

  const handlePurchase = (plan) => {
    if (plan.stripeLink) {
      // Track conversion event
      if (window.posthog) {
        window.posthog.capture('upgrade_clicked', {
          plan: plan.name,
          price: plan.price
        });
      }
      
      // Redirect to Stripe checkout
      window.open(plan.stripeLink, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Urgency */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-white">Limited Time Offer</h2>
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    50% OFF
                  </div>
                </div>
                <p className="text-gray-400">Unlock unlimited document processing power</p>
                <div className="flex items-center gap-2 mt-2 text-yellow-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-semibold">Expires in {timeLeft}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Social Proof Banner */}
            <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-4 mb-8">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Users className="w-5 h-5" />
                <span className="font-semibold">2,847 users upgraded in the last 30 days</span>
              </div>
            </div>

            {/* Plans */}
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(plans).map(([key, plan]) => (
                <motion.div
                  key={key}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                    plan.popular
                      ? 'border-yellow-400 bg-gradient-to-br from-yellow-400/10 to-blue-600/10'
                      : plan.limitations
                      ? 'border-gray-600 bg-slate-800/50'
                      : 'border-blue-500 bg-gradient-to-br from-blue-600/10 to-purple-600/10'
                  } hover:scale-105 cursor-pointer`}
                  whileHover={{ y: -5 }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                      plan.popular ? 'bg-yellow-400' : plan.limitations ? 'bg-gray-600' : 'bg-blue-600'
                    }`}>
                      {plan.limitations ? (
                        <Shield className="w-8 h-8 text-white" />
                      ) : plan.popular ? (
                        <Crown className="w-8 h-8 text-black" />
                      ) : (
                        <Zap className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        {plan.originalPrice && (
                          <span className="text-2xl text-gray-400 line-through">{plan.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-gray-400">{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {plan.savings}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePurchase(plan)}
                    disabled={plan.limitations}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      plan.limitations
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105'
                    }`}
                  >
                    {plan.limitations ? 'Current Plan' : 'Get Started'}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-gray-400">
              <p className="text-sm">
                ✨ 30-day money-back guarantee • Cancel anytime • Secure payments by Stripe
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;