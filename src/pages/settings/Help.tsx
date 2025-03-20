
import React from 'react';
import Layout from '../../components/Layout';
import AppHeader from '@/components/AppHeader';
import { ArrowLeft, HelpCircle, Mail, MessageCircle, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Help = () => {
  const navigate = useNavigate();
  
  const faqs = [
    {
      question: "How do I add a glucose reading?",
      answer: "To add a glucose reading, navigate to the 'Add Log' page and enter your measurement. You can also use the camera feature to scan your glucose meter."
    },
    {
      question: "How do I track what I've eaten?",
      answer: "In the 'Add Log' page, you can log food items manually or use the camera to scan your food. The AI assistant will help identify the food and estimate carbohydrates."
    },
    {
      question: "How do I view my glucose trends?",
      answer: "Your glucose trends are visible on the Dashboard page. You can see daily, weekly, and monthly trends to better understand your patterns."
    },
    {
      question: "How does the AI assistant work?",
      answer: "The AI assistant uses natural language processing to understand your questions and voice commands. It can help you log readings, find patterns, and offer insights based on your data."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take data security seriously. All your health data is encrypted and stored securely. You can review our privacy policy for more details."
    }
  ];
  
  return (
    <Layout title="Help">
      <AppHeader />
      <div className="pt-4 pb-28">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/profile')}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">Help & Support</h1>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Contact Support</h2>
            </div>
            
            <div className="p-4 grid gap-3">
              <Button variant="outline" className="justify-start">
                <Mail className="mr-2" size={18} />
                Email Support
              </Button>
              
              <Button variant="outline" className="justify-start">
                <MessageCircle className="mr-2" size={18} />
                Live Chat
              </Button>
              
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2" size={18} />
                Submit a Bug Report
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Frequently Asked Questions</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="px-4 py-3 text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-3">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Quick Tutorials</h2>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-xs">1</span>
                    </div>
                    <span>Getting Started with BuddyBetes</span>
                  </div>
                  <ChevronDown size={16} />
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-xs">2</span>
                    </div>
                    <span>Using the Glucose Scanner</span>
                  </div>
                  <ChevronDown size={16} />
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-xs">3</span>
                    </div>
                    <span>Working with the AI Assistant</span>
                  </div>
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center p-4">
            <div className="flex justify-center mb-3">
              <HelpCircle size={40} className="text-buddy-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Still need help?</h3>
            <p className="text-gray-500 text-sm mb-4">
              Our support team is available 24/7 to assist with any questions
            </p>
            <Button>Contact Us</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Help;
