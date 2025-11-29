'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Zap, 
  Shield, 
  Globe, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Rocket,
  Award,
  BarChart3
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Zap,
      title: 'Real-Time Streaming',
      description: 'Funds vest continuously per second. Watch your earnings grow in real-time.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'Built on Stellar blockchain with Soroban smart contracts. Every transaction is verifiable.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Globe,
      title: 'Global Payments',
      description: 'Send and receive payments anywhere in the world with minimal fees.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Fair Compensation',
      description: 'Get paid for the exact time you work. No more waiting for monthly paychecks.',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const stats = [
    { label: 'Active Streams', value: '1,234', icon: Clock },
    { label: 'Total Streamed', value: '2.5M XLM', icon: DollarSign },
    { label: 'Happy Builders', value: '567', icon: Users },
    { label: 'Tasks Completed', value: '3,890', icon: CheckCircle },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Create a Task',
      description: 'Admins post tasks with budgets and time requirements.',
      icon: Rocket,
    },
    {
      step: '2',
      title: 'Builders Apply',
      description: 'Talented builders apply and get approved for tasks.',
      icon: Users,
    },
    {
      step: '3',
      title: 'Start Streaming',
      description: 'Funds start vesting per second once work begins.',
      icon: Zap,
    },
    {
      step: '4',
      title: 'Withdraw Anytime',
      description: 'Builders can withdraw their earned funds at any moment.',
      icon: DollarSign,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Smart Contract Developer',
      avatar: 'SC',
      text: 'Finally, a platform that pays me fairly for my time. The real-time streaming is revolutionary!',
      rating: 5,
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Project Manager',
      avatar: 'MR',
      text: 'Managing payments has never been easier. The transparency and automation save us hours.',
      rating: 5,
    },
    {
      name: 'Aisha Patel',
      role: 'UI/UX Designer',
      avatar: 'AP',
      text: 'I love seeing my earnings grow in real-time. It motivates me to deliver quality work.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Built on Stellar Blockchain</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Get Paid Every Second
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">
                You Work
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Revolutionary payment streaming platform powered by Soroban smart contracts.
              Fair, transparent, and instant compensation for builders worldwide.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/stream-demo">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all"
                >
                  Watch Demo
                </motion.button>
              </Link>
            </div>

            {/* Stats Preview */}
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full mb-3">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Stellar Stream?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of payments with cutting-edge blockchain technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes with our simple 4-step process
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-transparent -ml-4"></div>
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4 relative">
                    <item.icon className="w-10 h-10 text-white" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Loved by Builders Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our community has to say about Stellar Stream
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 hover:shadow-xl transition-all"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Award key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to Transform Your Payments?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of builders and organizations already using Stellar Stream
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center space-x-2"
                >
                  <span>Start Streaming Now</span>
                  <Rocket className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/stream-demo">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center space-x-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>View Analytics</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Stellar Stream
              </h3>
              <p className="text-gray-400">
                Revolutionary payment streaming on Stellar blockchain.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/stream-demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://docs.stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Stellar Stream. Built with ❤️ on Stellar.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
