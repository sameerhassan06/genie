import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageSquare, Users, Calendar, BarChart3, Zap, Shield, Globe } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
      {/* Header */}
      <header className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ChatBot Pro</span>
          </div>
          <Button onClick={handleLogin} variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
            Sign In
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Transform Your Website with 
            <span className="text-primary"> AI-Powered Chatbots</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Multi-tenant SaaS platform that helps businesses capture leads, schedule appointments, 
            and provide instant customer support through intelligent chatbots.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleLogin} className="bg-primary hover:bg-primary/90 text-white px-8 py-3">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
          <p className="text-gray-300 text-lg">Powerful features designed for modern businesses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-colors">
            <CardHeader>
              <MessageSquare className="w-10 h-10 text-primary mb-2" />
              <CardTitle className="text-white">Smart Chatbots</CardTitle>
              <CardDescription className="text-gray-300">
                AI-powered chatbots that understand context and provide intelligent responses
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Users className="w-10 h-10 text-primary mb-2" />
              <CardTitle className="text-white">Lead Management</CardTitle>
              <CardDescription className="text-gray-300">
                Automatically capture and score leads with advanced CRM integration
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Calendar className="w-10 h-10 text-primary mb-2" />
              <CardTitle className="text-white">Appointment Booking</CardTitle>
              <CardDescription className="text-gray-300">
                Seamless appointment scheduling directly through chat conversations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-colors">
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-primary mb-2" />
              <CardTitle className="text-white">Advanced Analytics</CardTitle>
              <CardDescription className="text-gray-300">
                Detailed insights into customer interactions and conversion metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Zap className="w-10 h-10 text-primary mb-2" />
              <CardTitle className="text-white">AI Training</CardTitle>
              <CardDescription className="text-gray-300">
                Train your chatbot with website content for accurate, contextual responses
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Shield className="w-10 h-10 text-primary mb-2" />
              <CardTitle className="text-white">Enterprise Security</CardTitle>
              <CardDescription className="text-gray-300">
                Multi-tenant architecture with advanced security and data isolation
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Built for Modern Businesses
            </h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Globe className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Multi-Language Support</h3>
                  <p className="text-gray-300">Serve global customers with chatbots that speak their language</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Real-time Integration</h3>
                  <p className="text-gray-300">Connect with your existing tools and workflows seamlessly</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">White-label Ready</h3>
                  <p className="text-gray-300">Customize branding and appearance to match your business</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-8">
              <Card className="bg-gray-800/80 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Dashboard Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Conversations</span>
                      <span className="text-white font-bold">12,487</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">New Leads</span>
                      <span className="text-white font-bold">284</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Appointments</span>
                      <span className="text-white font-bold">156</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Customer Experience?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of businesses already using ChatBot Pro to increase conversions and improve customer satisfaction.
          </p>
          <Button size="lg" onClick={handleLogin} className="bg-primary hover:bg-primary/90 text-white px-8 py-3">
            Start Your Free Trial Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">ChatBot Pro</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 ChatBot Pro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
