import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  BarChart3, 
  Shield, 
  CheckCircle, 
  Star,
  TrendingUp,
  PieChart,
  FileCheck,
  Zap,
  Users,
  Award,
  ArrowRight,
  Download,
  Eye,
  Clock,
  Target,
  Loader,
  AlertCircle,
  Crown,
  Lock
} from 'lucide-react';
import { FileProcessor, AIAnalysisService } from '../utils/fileProcessor';
import PaymentModal from './PaymentModal';

const FinanceFlowLandingPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Usage tracking (in real app, this would be stored in localStorage or backend)
  const [dailyUsage, setDailyUsage] = useState(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('financeflow_usage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        return parsed;
      }
    }
    // Reset for new day
    const newUsage = { conversions: 0, analyses: 0, date: today };
    localStorage.setItem('financeflow_usage', JSON.stringify(newUsage));
    return newUsage;
  });
  
  // Check if user has exceeded free limits
  const hasExceededLimits = (action) => {
    const today = new Date().toDateString();
    if (dailyUsage.date !== today) {
      // Reset daily usage for new day
      const newUsage = { conversions: 0, analyses: 0, date: today };
      setDailyUsage(newUsage);
      localStorage.setItem('financeflow_usage', JSON.stringify(newUsage));
      return false;
    }
    
    if (action === 'conversion' && dailyUsage.conversions >= 3) return true;
    if (action === 'analysis' && dailyUsage.analyses >= 1) return true;
    return false;
  };

  // Update usage and save to localStorage
  const updateUsage = (action) => {
    const newUsage = {
      ...dailyUsage,
      [action === 'conversion' ? 'conversions' : 'analyses']: 
        dailyUsage[action === 'conversion' ? 'conversions' : 'analyses'] + 1
    };
    setDailyUsage(newUsage);
    localStorage.setItem('financeflow_usage', JSON.stringify(newUsage));
  };
  
  // Animation refs
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const testimonialsRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const howItWorksInView = useInView(howItWorksRef, { once: true });
  const testimonialsInView = useInView(testimonialsRef, { once: true });

  // File upload handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
      setAnalysisResult(null);
      setShowAnalysis(false);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setAnalysisResult(null);
      setShowAnalysis(false);
    }
  };

  // Convert document
  const handleConvert = async () => {
    if (!uploadedFile) {
      alert('Please upload a file first');
      return;
    }

    // Check free tier limits
    if (hasExceededLimits('conversion')) {
      setShowPaymentModal(true);
      return;
    }

    setProcessing(true);
    try {
      const conversions = FileProcessor.getSupportedConversions(uploadedFile.name);
      
      if (conversions.length === 0) {
        alert('File format not supported for conversion');
        return;
      }

      // For demo, convert to first available format
      const targetFormat = conversions[0];
      let result;

      if (targetFormat.includes('Excel')) {
        result = await FileProcessor.csvToExcel(uploadedFile);
      } else if (targetFormat.includes('CSV')) {
        result = await FileProcessor.excelToCsv(uploadedFile);
      } else if (targetFormat.includes('JSON')) {
        result = await FileProcessor.toJson(uploadedFile);
      }

      if (result) {
        FileProcessor.downloadFile(result);
        
        // Update usage tracking
        updateUsage('conversion');
        
        // Track conversion event
        if (window.posthog) {
          window.posthog.capture('document_converted', {
            file_type: uploadedFile.name.split('.').pop(),
            target_format: targetFormat
          });
        }
      }
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Conversion failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Analyze document
  const handleAnalyze = async () => {
    if (!uploadedFile) {
      alert('Please upload a file first');
      return;
    }

    // Check free tier limits
    if (hasExceededLimits('analysis')) {
      setShowPaymentModal(true);
      return;
    }

    setProcessing(true);
    try {
      const analysis = await AIAnalysisService.analyzeDocument(uploadedFile);
      setAnalysisResult(analysis);
      setShowAnalysis(true);
      
      // Update usage tracking
      setDailyUsage(prev => ({ 
        ...prev, 
        analyses: prev.analyses + 1 
      }));
      
      // Track analysis event
      if (window.posthog) {
        window.posthog.capture('document_analyzed', {
          file_type: uploadedFile.name.split('.').pop(),
          file_size: uploadedFile.size
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1620519157189-c06a79a52f99?q=80&w=2000" 
            alt="Modern Financial Technology" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/85 to-slate-800/90"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Upgrade Button */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <button
                onClick={() => setShowPaymentModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Crown className="w-5 h-5" />
                Upgrade to Pro
                <span className="bg-yellow-700 text-yellow-100 px-2 py-1 rounded-full text-xs ml-2">
                  50% OFF
                </span>
              </button>
            </motion.div>

            {/* Brand Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent mb-4">
                FinanceFlow
              </h1>
              <p className="text-xl md:text-2xl text-blue-200 font-light">
                Transform Your Financial Documents with AI-Powered Intelligence
              </p>
            </motion.div>

            {/* Usage Stats */}
            {(dailyUsage.conversions > 0 || dailyUsage.analyses > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex justify-center gap-6 text-sm"
              >
                <div className="bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50">
                  <span className="text-gray-400">Conversions today: </span>
                  <span className="text-blue-400 font-semibold">{dailyUsage.conversions}/3</span>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50">
                  <span className="text-gray-400">Analyses today: </span>
                  <span className="text-yellow-400 font-semibold">{dailyUsage.analyses}/1</span>
                </div>
              </motion.div>
            )}

            {/* Main Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
            >
              Convert Any Financial Document &<br />
              <span className="text-yellow-400">Get Instant AI Analysis</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Upload your financial documents and instantly convert them to any format or receive detailed AI-powered analysis including categorization, trends, and expense insights.
            </motion.p>

            {/* File Upload Area */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mb-8"
            >
              <div
                className={`relative max-w-lg mx-auto p-8 rounded-2xl border-2 border-dashed transition-all duration-300 backdrop-blur-md ${
                  dragActive 
                    ? 'border-yellow-400 bg-yellow-400/10' 
                    : 'border-blue-400/50 bg-white/5 hover:bg-white/10'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv,.txt,.docx"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="text-center">
                  <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <p className="text-green-400 font-semibold">File uploaded!</p>
                      <p className="text-gray-300 text-sm">{uploadedFile.name}</p>
                      <p className="text-gray-400 text-xs">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white font-semibold mb-2">
                        Drag & drop your financial document here
                      </p>
                      <p className="text-gray-400 text-sm">
                        Or click to browse (PDF, Excel, CSV, TXT, DOCX)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button 
                onClick={handleConvert}
                disabled={!uploadedFile || processing}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {hasExceededLimits('conversion') && !processing && <Lock className="w-4 h-4" />}
                {processing ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Convert Document
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                {hasExceededLimits('conversion') && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">
                    PRO
                  </span>
                )}
              </button>
              
              <button 
                onClick={handleAnalyze}
                disabled={!uploadedFile || processing}
                className="group relative px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {hasExceededLimits('analysis') && !processing && <Lock className="w-4 h-4" />}
                {processing ? <Loader className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
                AI Analysis
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                {hasExceededLimits('analysis') && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">
                    PRO
                  </span>
                )}
              </button>
            </motion.div>

            {/* Analysis Results */}
            {showAnalysis && analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-12 max-w-4xl mx-auto"
              >
                <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-yellow-400" />
                    {analysisResult.summary}
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {analysisResult.insights.map((insight, index) => (
                      <div key={index} className="space-y-3">
                        <h4 className="text-lg font-semibold text-blue-300">{insight.category}</h4>
                        <ul className="space-y-2">
                          {insight.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-gray-300 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  
                  {analysisResult.fileInfo && (
                    <div className="mt-6 pt-6 border-t border-slate-700/50">
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span>File: {analysisResult.fileInfo.name}</span>
                        <span>Size: {analysisResult.fileInfo.size}</span>
                        <span>Processed: {analysisResult.fileInfo.processedAt}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-400"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Client-Side Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                <span>AI-Powered Analysis</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features for 
              <span className="text-yellow-400"> Smart Finance</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to transform, analyze, and understand your financial documents with cutting-edge AI technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FileCheck className="w-8 h-8" />,
                title: "Universal Conversion",
                description: "Convert any financial document to PDF, Excel, CSV, Word, or any format you need with perfect formatting.",
                image: "https://images.unsplash.com/photo-1579444741963-5ae219cfe27c?q=80&w=800"
              },
              {
                icon: <PieChart className="w-8 h-8" />,
                title: "Smart Categorization",
                description: "AI automatically categorizes your expenses, income, and transactions for better financial organization.",
                image: "https://images.unsplash.com/photo-1660020619062-70b16c44bf0f?q=80&w=800"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Trend Analysis",
                description: "Discover spending patterns, identify trends, and get insights to make better financial decisions.",
                image: "https://images.unsplash.com/photo-1584472666879-7d92db132958?q=80&w=800"
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Expense Insights",
                description: "Get detailed breakdowns of your expenses with visual charts and actionable recommendations.",
                image: "https://images.unsplash.com/photo-1639815188546-c43c240ff4df?q=80&w=800"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Bank-Grade Security",
                description: "Your financial data is protected with enterprise-level encryption and security protocols.",
                image: "https://images.unsplash.com/photo-1590494165264-1ebe3602eb80?q=80&w=800"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Instant Processing",
                description: "Get results in seconds, not hours. Our AI processes documents lightning-fast with accuracy.",
                image: "https://images.unsplash.com/photo-1620519157189-c06a79a52f99?q=80&w=800"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative h-64 rounded-t-2xl overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  <div className="absolute top-4 left-4 p-3 bg-blue-600/90 backdrop-blur-sm rounded-xl text-white">
                    {feature.icon}
                  </div>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-b-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-20 bg-slate-800/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It <span className="text-yellow-400">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Three simple steps to transform your financial documents and gain valuable insights.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Upload Document",
                description: "Drag and drop or select your financial document. We support all major formats including PDF, Excel, CSV, and more.",
                icon: <Upload className="w-8 h-8" />
              },
              {
                step: "02",
                title: "Choose Action",
                description: "Select whether you want to convert your document to a different format or get detailed AI analysis.",
                icon: <Target className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Get Results",
                description: "Receive your converted document or comprehensive analysis with insights, trends, and recommendations.",
                icon: <CheckCircle className="w-8 h-8" />
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center group"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full mx-auto flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by <span className="text-yellow-400">Professionals</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              See what our users say about FinanceFlow and how it's transforming their financial workflow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Sarah Chen",
                role: "Financial Analyst",
                company: "Tech Innovations Inc.",
                image: "https://images.unsplash.com/photo-1496180470114-6ef490f3ff22?q=80&w=400",
                testimonial: "FinanceFlow has completely transformed how I handle financial documents. The AI analysis is incredibly accurate and saves me hours of manual work every week.",
                rating: 5
              },
              {
                name: "Michael Rodriguez",
                role: "Small Business Owner",
                company: "Rodriguez Consulting",
                image: "https://images.unsplash.com/photo-1599090738077-75d2187fd892?q=80&w=400",
                testimonial: "The expense categorization and trend analysis features are game-changers. I finally have clear insights into my business finances without the complexity.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                animate={testimonialsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="text-white font-semibold text-lg">{testimonial.name}</h4>
                    <p className="text-gray-400">{testimonial.role}</p>
                    <p className="text-blue-400 text-sm">{testimonial.company}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-300 leading-relaxed italic">"{testimonial.testimonial}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your 
              <span className="text-yellow-400"> Financial Documents?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust FinanceFlow for their document conversion and analysis needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group px-10 py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3">
                Get Started Free
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            
            <p className="text-gray-400 mt-6">No credit card required • Start processing in seconds</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              FinanceFlow
            </h3>
            <p className="text-gray-400 mb-8">
              Transform Your Financial Documents with AI-Powered Intelligence
            </p>
            
            <div className="flex justify-center items-center gap-8 text-gray-400 text-sm">
              <span>© 2025 FinanceFlow. All rights reserved.</span>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FinanceFlowLandingPage;