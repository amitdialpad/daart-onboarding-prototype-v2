// Agent Templates
export const agentTemplates = [
  {
    id: 'support',
    name: 'Customer Support Bot',
    description: 'Handles customer support inquiries, FAQs, and basic troubleshooting',
    category: 'Support',
    channels: ['web-chat', 'phone', 'sms'],
    sampleAgent: {
      name: 'Support Assistant',
      description: 'Handles customer support inquiries and FAQs',
      instructions: 'Be helpful, friendly, and concise. Always acknowledge the customer\'s issue before providing solutions. If you cannot help, offer to transfer to a human agent.',
      knowledge: [
        {
          id: 1,
          name: 'FAQ.pdf',
          size: '120KB',
          status: 'processed',
          topics: 15,
          content: `# Frequently Asked Questions

## Shipping & Delivery
Q: How long does shipping take?
A: Standard shipping takes 5-7 business days. Express shipping is 2-3 business days.

Q: Do you ship internationally?
A: Yes, we ship to over 50 countries worldwide.

Q: How can I track my order?
A: You'll receive a tracking number via email once your order ships.

## Returns & Refunds
Q: What is your return policy?
A: We accept returns within 30 days of purchase for a full refund.

Q: How do I start a return?
A: Contact our support team or visit your account dashboard to initiate a return.

Q: When will I receive my refund?
A: Refunds are processed within 5-7 business days after we receive your return.

## Account & Orders
Q: How do I reset my password?
A: Click "Forgot Password" on the login page and follow the instructions.

Q: Can I change my order after placing it?
A: Contact us within 1 hour of placing your order and we'll do our best to help.

Q: How do I update my shipping address?
A: You can update your address in your account settings before the order ships.

## Products
Q: Are your products eco-friendly?
A: Yes, all our products are made from sustainable materials.

Q: Do you offer warranties?
A: All products come with a 1-year manufacturer warranty.

Q: Can I see product reviews?
A: Yes, reviews are available on each product page.`
        }
      ],
      skills: [
        {
          id: 1,
          name: 'Order Lookup',
          description: 'Look up order status by order number',
          enabled: true
        },
        {
          id: 2,
          name: 'Return Policy',
          description: 'Provide return and refund information',
          enabled: true
        }
      ],
      testScenarios: [
        {
          id: 1,
          name: 'Shipping inquiry',
          prompt: 'How long does shipping take?',
          expectedKeywords: ['5-7 business days', 'standard shipping']
        },
        {
          id: 2,
          name: 'Return policy',
          prompt: 'What is your return policy?',
          expectedKeywords: ['30 days', 'full refund']
        },
        {
          id: 3,
          name: 'Order tracking',
          prompt: 'How can I track my order?',
          expectedKeywords: ['tracking number', 'email']
        }
      ]
    }
  },
  {
    id: 'sales',
    name: 'Sales Qualifier',
    description: 'Qualifies leads, answers product questions, and schedules meetings',
    category: 'Sales',
    channels: ['web-chat', 'sms'],
    sampleAgent: {
      name: 'Sales Assistant',
      description: 'Qualifies leads and answers product questions',
      instructions: 'Be professional and enthusiastic about the product. Ask qualifying questions to understand the prospect\'s needs. Offer to schedule a call with the sales team for qualified leads.',
      knowledge: [
        {
          id: 1,
          name: 'Product Info.pdf',
          size: '95KB',
          status: 'processed',
          topics: 12,
          content: `# Product Information

## Our Platform
We offer a comprehensive AI agent platform that helps businesses automate customer conversations across multiple channels.

## Key Features
- Voice & Phone Agents: Deploy AI agents that answer phone calls
- Multi-channel Support: Web chat, phone, SMS, and more
- Smart Handoffs: Seamless transfer to human agents with context
- Real-time Analytics: Monitor performance and improve over time
- Easy Integration: Connect with your existing tools

## Pricing
- Starter: $99/month - Up to 500 conversations
- Professional: $299/month - Up to 2,000 conversations
- Enterprise: Custom pricing - Unlimited conversations

## Use Cases
- Customer Support Automation
- Sales Lead Qualification
- Appointment Scheduling
- Order Tracking
- FAQ Handling`
        }
      ],
      skills: [
        {
          id: 1,
          name: 'Lead Capture',
          description: 'Collect prospect information',
          enabled: true
        },
        {
          id: 2,
          name: 'Meeting Scheduler',
          description: 'Schedule calls with sales team',
          enabled: true
        }
      ],
      testScenarios: [
        {
          id: 1,
          name: 'Pricing inquiry',
          prompt: 'How much does it cost?',
          expectedKeywords: ['$99', 'Starter', 'pricing']
        },
        {
          id: 2,
          name: 'Feature question',
          prompt: 'Do you support phone agents?',
          expectedKeywords: ['voice', 'phone', 'calls']
        }
      ]
    }
  },
  {
    id: 'appointment',
    name: 'Appointment Scheduler',
    description: 'Schedules appointments and manages calendar availability',
    category: 'Operations',
    channels: ['phone', 'sms', 'web-chat'],
    sampleAgent: {
      name: 'Appointment Bot',
      description: 'Schedules appointments and manages availability',
      instructions: 'Be efficient and clear about available time slots. Confirm all appointment details before booking. Send confirmation messages after scheduling.',
      knowledge: [
        {
          id: 1,
          name: 'Business Hours.txt',
          size: '8KB',
          status: 'processed',
          topics: 5,
          content: `# Business Hours & Services

## Operating Hours
Monday-Friday: 9:00 AM - 6:00 PM
Saturday: 10:00 AM - 4:00 PM
Sunday: Closed

## Services Offered
- Initial Consultation (30 min)
- Standard Appointment (1 hour)
- Extended Session (2 hours)
- Virtual Meeting (30 min)

## Appointment Types
All appointments can be scheduled online or by phone.
Cancellations require 24-hour notice.`
        }
      ],
      skills: [
        {
          id: 1,
          name: 'Calendar Integration',
          description: 'Check availability and book appointments',
          enabled: true
        }
      ],
      testScenarios: [
        {
          id: 1,
          name: 'Check availability',
          prompt: 'What times are available tomorrow?',
          expectedKeywords: ['available', 'time slots']
        }
      ]
    }
  },
  {
    id: 'order-tracking',
    name: 'Order Tracking Bot',
    description: 'Provides real-time order status updates',
    category: 'Support',
    channels: ['web-chat', 'sms'],
    sampleAgent: {
      name: 'Order Tracker',
      description: 'Provides real-time order status updates',
      instructions: 'Be clear and specific about order status. Provide tracking links when available. Offer to escalate if there are issues with the order.',
      knowledge: [
        {
          id: 1,
          name: 'Shipping Info.txt',
          size: '12KB',
          status: 'processed',
          topics: 8,
          content: `# Order & Shipping Information

## Order Status Meanings
- Processing: Your order is being prepared
- Shipped: Your order is on its way
- Out for Delivery: Your order will arrive today
- Delivered: Your order has been delivered

## Tracking Your Order
You can track your order using the tracking number sent to your email.
Tracking updates every 4-6 hours.

## Delivery Issues
If your order hasn't arrived within the expected timeframe, contact support.`
        }
      ],
      skills: [
        {
          id: 1,
          name: 'Order Lookup',
          description: 'Look up order by order number',
          enabled: true
        },
        {
          id: 2,
          name: 'Status Update',
          description: 'Provide real-time status updates',
          enabled: true
        }
      ],
      testScenarios: [
        {
          id: 1,
          name: 'Order status check',
          prompt: 'Where is my order #12345?',
          expectedKeywords: ['order', 'status', 'tracking']
        }
      ]
    }
  },
  {
    id: 'simple-faq',
    name: 'Simple FAQ Bot',
    description: 'Answers frequently asked questions',
    category: 'Support',
    channels: ['web-chat'],
    sampleAgent: {
      name: 'FAQ Assistant',
      description: 'Answers frequently asked questions',
      instructions: 'Provide clear, concise answers to common questions. If the question is not in the knowledge base, offer to connect with a human agent.',
      knowledge: [
        {
          id: 1,
          name: 'General FAQ.txt',
          size: '15KB',
          status: 'processed',
          topics: 10,
          content: `# General FAQs

## Contact Information
Email: support@company.com
Phone: 1-800-555-0123
Hours: Monday-Friday, 9 AM - 5 PM EST

## Common Questions
Q: How do I contact support?
A: You can email us at support@company.com or call 1-800-555-0123

Q: What are your business hours?
A: We're available Monday through Friday, 9 AM to 5 PM EST

Q: Do you offer live chat?
A: Yes, this chat is monitored during business hours`
        }
      ],
      skills: [],
      testScenarios: [
        {
          id: 1,
          name: 'Contact info',
          prompt: 'How do I contact support?',
          expectedKeywords: ['email', 'phone', 'support@company.com']
        }
      ]
    }
  }
]

export function getTemplateById(id) {
  return agentTemplates.find(t => t.id === id)
}

export function createAgentFromTemplate(templateId) {
  const template = getTemplateById(templateId)
  if (!template) return null

  return {
    ...template.sampleAgent,
    id: Date.now(),
    templateId: template.id,
    status: 'draft',
    statusText: 'Draft',
    channel: template.channels[0],
    channels: template.channels,
    lastUpdated: 'Just now',
    conversations: 0,
    deflectionRate: 0,
    satisfaction: '-',
    createdAt: new Date().toISOString()
  }
}
