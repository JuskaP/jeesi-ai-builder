import { useParams, Link, Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, ArrowLeft, Share2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NewsletterForm from "@/components/NewsletterForm";

interface BlogPostData {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  content: string;
}

const blogPostsData: Record<string, BlogPostData> = {
  "ai-agents-future-of-business": {
    title: "Why AI Agents Are the Future of Every Business",
    excerpt: "Discover how AI agents are revolutionizing the way businesses operate.",
    category: "AI Insights",
    readTime: "6 min read",
    date: "December 2, 2025",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80",
    content: `
## The AI Revolution Is Here

We're standing at the precipice of a fundamental shift in how businesses operate. Just as the internet transformed commerce in the 2000s and mobile reshaped customer engagement in the 2010s, AI agents are poised to redefine the very nature of work in 2025 and beyond.

But what exactly are AI agents, and why should every business leader pay attention?

---

## What Are AI Agents?

Unlike traditional software that follows rigid, pre-programmed rules, AI agents are intelligent systems capable of understanding context, making decisions, and taking actions autonomously. They can:

- **Understand natural language** — Customers can interact with them just like they would with a human
- **Learn and adapt** — They improve their performance based on interactions
- **Handle complex tasks** — From customer inquiries to data analysis to scheduling
- **Work 24/7** — Without breaks, vacations, or sick days

---

## The Business Case for AI Agents

### 1. Dramatic Cost Reduction

The average customer service representative costs a business €35,000-50,000 annually when you factor in salary, benefits, training, and overhead. An AI agent can handle the workload of multiple representatives at a fraction of the cost.

> **Real numbers:** Businesses implementing AI agents report 40-60% reduction in customer service costs within the first year.

### 2. Scalability Without Limits

During peak seasons or viral moments, human teams struggle to scale. AI agents can handle 10 or 10,000 simultaneous conversations without quality degradation.

### 3. Consistency and Accuracy

Human agents have bad days. They forget information. They vary in skill level. AI agents deliver consistent, accurate responses every single time—while continuously improving.

### 4. Data-Driven Insights

Every interaction becomes a data point. AI agents don't just serve customers; they gather invaluable insights about customer needs, pain points, and opportunities.

---

## Industries Being Transformed

### E-Commerce
AI agents handle product recommendations, order tracking, returns processing, and personalized shopping assistance. Companies report **25% increase in average order value**.

### Healthcare
From appointment scheduling to symptom checking to medication reminders, AI agents are making healthcare more accessible and efficient.

### Finance
Fraud detection, account inquiries, loan applications, and financial advice—all enhanced by AI agents that never sleep.

### Real Estate
Property matching, scheduling viewings, answering inquiries, and qualifying leads—tasks that used to consume hours now happen instantly.

---

## The Competitive Advantage

Here's the uncomfortable truth: your competitors are already exploring AI agents. The question isn't whether to adopt this technology—it's whether you'll be a leader or a laggard.

**Early adopters are seeing:**
- 3x faster response times
- 50% reduction in operational costs
- 90%+ customer satisfaction rates
- Significant competitive differentiation

---

## Getting Started

The journey to AI adoption doesn't have to be overwhelming. Platforms like jeesi.ai make it possible to build and deploy custom AI agents without any coding knowledge. You can start small—perhaps with a FAQ bot or appointment scheduler—and expand as you see results.

---

## The Future Is Autonomous

The businesses that thrive in the next decade will be those that embrace AI agents not as a replacement for human workers, but as powerful tools that amplify human capabilities. They'll free your team to focus on high-value, creative, and strategic work while AI handles the repetitive and routine.

The future of business isn't just digital—it's intelligent. The question is: will you be part of it?
    `
  },
  "founders-guide-ai-delegation": {
    title: "The Founder's Guide to AI Delegation: Work Smarter, Not Harder",
    excerpt: "Learn how successful founders are leveraging AI agents to reclaim their time.",
    category: "Entrepreneurship",
    readTime: "8 min read",
    date: "December 1, 2025",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&auto=format&fit=crop&q=80",
    content: `
## The Founder's Dilemma

Every founder knows the feeling: there are never enough hours in the day. You're simultaneously the CEO, customer service rep, marketing director, and sometimes even the janitor. It's exhilarating—and exhausting.

What if you could clone yourself? Not literally, of course, but what if you could delegate tasks to an intelligent assistant that works 24/7, never complains, and costs a fraction of a human hire?

**Welcome to the era of AI delegation.**

---

## The Hidden Cost of "Doing It All"

Before we dive into solutions, let's acknowledge the problem. Research shows founders spend:

| Activity | Time Spent |
|----------|------------|
| Administrative tasks | 35% |
| Customer inquiries and support | 25% |
| Scheduling and coordination | 15% |
| Strategic work that grows the business | Only 25% |

That's **75% of your time** on tasks that could be delegated. At €200/hour (a conservative founder's time value), that's **€30,000+ per month** in opportunity cost.

---

## What Can AI Agents Handle?

The short answer: more than you think. Here's a breakdown:

### Customer Interactions
- Answering FAQs
- Processing orders and returns
- Handling complaints (escalating when necessary)
- Gathering feedback
- Qualifying leads

### Internal Operations
- Scheduling meetings
- Sending reminders and follow-ups
- Onboarding new customers
- Data entry and organization
- Report generation

### Sales & Marketing
- Initial lead engagement
- Product recommendations
- Campaign response handling
- Social media inquiries
- Review requests

---

## Real Founder Stories

> ### Maria — E-Commerce Founder
> *"I was spending 4 hours daily answering the same questions about shipping and returns. My AI agent handles 95% of those inquiries now. I've used that time to launch two new product lines."*

> ### Johan — SaaS Startup CEO
> *"Our AI agent qualifies leads 24/7. When I wake up, I have a list of hot prospects ready for a call instead of an inbox full of maybe-they're-interested leads."*

> ### Kaisa — Consulting Business Owner
> *"Scheduling was my nightmare—back and forth emails, timezone confusion, no-shows. Now my AI agent handles all of it. My calendar is actually organized for the first time in years."*

---

## The Art of AI Delegation

### Step 1: Identify Repetitive Tasks
Spend one week logging every task you do. Highlight anything you do more than twice. These are your delegation candidates.

### Step 2: Document Your Process
How do you currently handle these tasks? What information do you need? What are common scenarios? This documentation becomes your AI agent's training material.

### Step 3: Start Small
Don't try to automate everything at once. Pick one high-frequency, low-complexity task. Master that before expanding.

### Step 4: Monitor and Refine
Your AI agent will learn and improve, but it needs guidance. Review interactions, provide feedback, and continuously refine.

### Step 5: Scale Gradually
Once your first AI agent is running smoothly, identify the next candidate. Build your AI workforce one agent at a time.

---

## The Psychology of Letting Go

Many founders struggle with delegation—human or AI. Common fears:

**"No one can do it as well as me"**
> Reality check: A well-configured AI agent will be MORE consistent than you on routine tasks.

**"Customers will hate talking to a bot"**
> Research shows 73% of customers prefer AI for quick questions. They hate waiting, not automation.

**"What if something goes wrong?"**
> Build in escalation paths. AI handles routine; humans handle exceptions.

---

## The Competitive Reality

Your competitors are adopting AI. The founders who resist delegation will find themselves:
- Working more hours, not fewer
- Growing slower than AI-enabled competitors
- Burning out while others scale

The founders who embrace AI delegation will:
- Focus on high-impact strategic work
- Scale operations without proportional cost increases
- Actually take vacations (yes, really)

---

## Getting Started Today

Building an AI agent used to require technical expertise and significant investment. Not anymore.

With platforms like **jeesi.ai**, you can:
1. Describe what you want your agent to do in plain language
2. Customize its personality and knowledge base
3. Deploy it on your website, social media, or anywhere else
4. Monitor and improve over time

No coding. No massive budget. Just results.

---

## The Future of Founder Work

The most successful founders of the next decade won't be those who work the most hours. They'll be those who work the smartest—leveraging AI to multiply their impact while maintaining their sanity.

**It's time to stop being proud of your 80-hour weeks. It's time to be proud of what you accomplish—with a little AI help.**
    `
  },
  "getting-started-jeesi-ai": {
    title: "Getting Started with jeesi.ai: Build Your First AI Agent in Minutes",
    excerpt: "A step-by-step guide to creating your first AI agent.",
    category: "Tutorial",
    readTime: "5 min read",
    date: "November 30, 2025",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80",
    content: `
## Welcome to jeesi.ai

So you've decided to build your first AI agent. Excellent choice! Whether you want to automate customer support, qualify leads, or handle appointments, you're about to discover how easy it can be.

This guide will walk you through every step—from account creation to deploying your first agent.

---

## What You'll Need

- ✅ An email address
- ✅ A clear idea of what you want your agent to do
- ✅ 10-15 minutes of your time

That's it. No coding skills. No technical background. Just you and your vision.

---

## Step 1: Create Your Account

1. Head to **jeesi.ai**
2. Click **"Sign Up"** or **"Get Started"**
3. Enter your email and create a password
4. Verify your email (check your spam folder if needed)

You'll land on your dashboard—your command center for all things AI.

---

## Step 2: Meet Helpie, Your AI Guide

Here's where jeesi.ai gets special. Instead of filling out complicated forms, you'll have a conversation with **Helpie**, our AI assistant.

Helpie will ask you questions like:
- What's your business about?
- What tasks do you want to automate?
- How should your agent sound? (Professional? Friendly? Casual?)

Just answer naturally—Helpie handles the technical translation.

### Pro Tips for Talking to Helpie

| Do This | Not This |
|---------|----------|
| "I want to answer questions about our return policy" | "I need customer service" |
| "Customers often ask about shipping times to Europe" | "Help with shipping" |
| "We're a fun, playful brand" | "Just be normal" |

---

## Step 3: Review Your Agent Configuration

After your conversation, Helpie will generate an agent configuration. You'll see:

- **Agent Name** — What your agent is called
- **Purpose** — Its primary function
- **System Prompt** — The instructions that guide its behavior
- **Personality** — How it communicates

Review everything. Want changes? Just tell Helpie: *"Make it more formal"* or *"Add information about our warranty."*

---

## Step 4: Add Your Knowledge Base

Your AI agent is smart, but it needs YOUR knowledge to be truly useful. Add:

### FAQs
- What are your most common customer questions?
- What are your policies (shipping, returns, refunds)?

### Product/Service Information
- What do you sell?
- What makes you different?
- Pricing information (if applicable)

### Company Details
- Business hours
- Contact information
- Location details

> **Pro Tip:** Start with your top 10 most frequent questions. You can always add more later.

---

## Step 5: Test Your Agent

Before going live, test thoroughly:

1. Click **"Test Agent"** in your dashboard
2. Ask questions your customers might ask
3. Try edge cases and unusual questions
4. Check that the tone matches your brand

### Questions to Test
- Basic inquiries (*"What are your hours?"*)
- Product questions (*"Do you offer free shipping?"*)
- Complex scenarios (*"I want to return an item I bought 45 days ago"*)
- Off-topic questions (How does it handle *"What's the weather?"*)

Not happy with a response? Go back to Helpie and refine your agent.

---

## Step 6: Deploy Your Agent

Ready to go live? You have several options:

### Website Widget
Get a simple embed code to add your agent to any website.

### iFrame Embed
For more control over placement and styling.

### API Access
For custom integrations, generate an API key in your dashboard.

---

## Step 7: Monitor and Improve

Your work isn't done after deployment. Great agents improve over time:

1. **Check Conversations** — Review what customers are asking
2. **Identify Gaps** — Find questions your agent struggles with
3. **Update Knowledge** — Add new information as your business evolves
4. **Track Metrics** — Monitor response times and customer satisfaction

---

## Common First-Timer Mistakes

### ❌ Too Vague
*"Help customers"* → Be specific about what kind of help

### ❌ Too Much Information at Once
Uploading your entire website → Start with core FAQs, expand gradually

### ❌ No Testing
Deploy immediately → Test with 20+ different questions first

### ❌ Set and Forget
Never looking at conversations → Weekly review of agent performance

---

## You're Ready!

That's it—you've just learned everything you need to build your first AI agent on jeesi.ai.

**Remember:**
- Start simple, expand later
- Test thoroughly before deploying
- Review and improve continuously

Your AI agent journey starts with a single conversation with Helpie. What are you waiting for?
    `
  },
  "implementing-jeesi-ai-business": {
    title: "How to Implement jeesi.ai in Your Business: A Complete Strategy Guide",
    excerpt: "From identifying use cases to measuring ROI, this comprehensive guide shows you how to successfully integrate AI agents.",
    category: "Strategy",
    readTime: "10 min read",
    date: "November 28, 2025",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
    content: `
## Beyond the Basics: Strategic AI Implementation

You've heard about AI agents. Maybe you've even built a test one on jeesi.ai. But how do you move from experimentation to strategic implementation that delivers real business results?

This guide is for business leaders ready to make AI agents a core part of their operations.

---

## Phase 1: Discovery & Planning

### Conduct an AI Readiness Assessment

Before building anything, answer these questions:

1. **What repetitive tasks consume the most time?**
   - Survey your team
   - Track time spent on various activities
   - Identify bottlenecks

2. **Where do customers experience friction?**
   - Analyze support tickets
   - Review website analytics (where do people drop off?)
   - Gather customer feedback

3. **What processes are most documented?**
   - Well-documented processes are easiest to automate
   - Start here for quick wins

---

### Prioritize Use Cases

Not all AI implementations are equal. Score potential use cases on:

| Criteria | Weight |
|----------|--------|
| Time savings | 30% |
| Customer impact | 25% |
| Implementation complexity | 20% |
| Cost savings | 15% |
| Strategic value | 10% |

**Quick Win Examples:**
- FAQ automation (high volume, low complexity)
- Appointment scheduling
- Order status inquiries
- Lead qualification

**Strategic Investments:**
- Personalized product recommendations
- Complex customer service scenarios
- Sales conversation handling

---

## Phase 2: Building Your First Agent

### Define Success Metrics First

Before building, know how you'll measure success:

**Operational Metrics:**
- Response time reduction
- Tickets/inquiries handled per hour
- Escalation rate
- First-contact resolution rate

**Business Metrics:**
- Cost per interaction
- Customer satisfaction score
- Conversion rate (for sales agents)
- Revenue influenced

---

### Create Your Knowledge Architecture

Your AI agent's effectiveness depends on its knowledge. Structure it properly:

| Knowledge Level | Examples |
|----------------|----------|
| **Core (Must Have)** | Company info, products, policies, pricing, FAQs |
| **Contextual (Should Have)** | Industry terms, competitor comparisons, promotions |
| **Edge Case (Nice to Have)** | Rare scenarios, historical context, technical specs |

---

### Design the Conversation Flow

Map out typical conversation paths:

1. **Greeting** → What's the standard opening?
2. **Inquiry Classification** → What types of questions will come in?
3. **Response Generation** → How should the agent respond?
4. **Escalation Triggers** → When should a human take over?
5. **Closing** → How should conversations end?

---

## Phase 3: Integration Strategy

### Website Integration Options

**Option A: Full-Page Chat**
- Best for: Support-focused businesses
- Dedicated /chat page with full-screen experience

**Option B: Widget (Floating)**
- Best for: E-commerce, SaaS
- Non-intrusive, available on all pages

**Option C: Embedded Chat**
- Best for: Service businesses
- Specific page placement with contextual help

---

### Multi-Channel Deployment

Don't limit your agent to your website:

- **Email Integration** — Auto-respond to common inquiries
- **Social Media** — Handle DMs and comments
- **Mobile App** — In-app support
- **Internal Tools** — Employee assistance

---

## Phase 4: Team Training & Change Management

### Prepare Your Team

AI agents don't replace your team—they augment it. Help your team understand:

**What Changes:**
- They'll handle fewer routine queries
- More time for complex, high-value interactions
- New skill: AI supervision and improvement

**What Stays the Same:**
- Human judgment for complex cases
- Relationship building
- Creative problem-solving

---

### Establish Escalation Protocols

Define clear rules for when AI hands off to humans:

**Automatic Escalation:**
- Sentiment detection (angry customer)
- Specific keywords ("speak to manager")
- Complexity threshold exceeded
- Unable to answer after X attempts

---

## Phase 5: Launch & Optimization

### Soft Launch Strategy

Don't flip the switch for everyone at once:

| Week | Exposure |
|------|----------|
| Week 1-2 | Internal testing only |
| Week 3-4 | Limited customer exposure (10%) |
| Week 5-6 | Expand to 50% |
| Week 7+ | Full deployment |

---

### Continuous Improvement Cycle

**Daily:** Review escalated conversations, check for knowledge gaps

**Weekly:** Analyze patterns, update knowledge base, refine flows

**Monthly:** A/B test approaches, add capabilities, expand use cases

---

## Measuring ROI

### Calculate Your Investment

**Direct Costs:**
- jeesi.ai subscription
- Implementation time
- Training time

**Indirect Costs:**
- Change management
- Process documentation
- Ongoing optimization

---

### Track Your Returns

**Hard Savings:**
- Reduced labor costs
- Lower cost per interaction
- Decreased overtime

**Soft Benefits:**
- Faster response times
- Improved customer satisfaction
- Employee satisfaction (less burnout)
- 24/7 availability

---

### ROI Example

> **Investment:** €10,000/year (subscription + implementation)
> 
> **Returns:** €50,000/year (labor savings + revenue increase)
> 
> **ROI:** 400%

---

## Common Implementation Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Over-Engineering | Trying to handle every scenario from day one | Start simple, expand based on real data |
| Under-Communicating | Surprising customers with AI | Be transparent about AI assistance |
| Neglecting Maintenance | "Set and forget" mentality | Schedule regular review sessions |
| Ignoring Feedback | Not acting on insights | Create feedback loops and act on them |

---

## Your Implementation Roadmap

| Month | Focus |
|-------|-------|
| Month 1 | Discovery & planning |
| Month 2 | Build & test first agent |
| Month 3 | Soft launch & iterate |
| Month 4 | Full deployment |
| Month 5+ | Expand & optimize |

---

## Ready to Transform Your Business?

Implementing AI agents isn't just about technology—it's about reimagining how your business operates. Done right, it frees your team to do meaningful work while delivering better customer experiences at lower costs.

**The businesses that master AI implementation today will be the leaders of tomorrow.**
    `
  }
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  
  const post = slug ? blogPostsData[slug] : null;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Share",
        description: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/blog">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <header className="mb-10">
          <Badge variant="secondary" className="mb-4">{post.category}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Article
            </span>
            <Button variant="ghost" size="sm" onClick={handleShare} className="gap-1 ml-auto">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full aspect-video object-cover rounded-xl"
          />
        </header>

        <div 
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(post.content) }}
        />

        {/* Newsletter CTA */}
        <div className="mt-12 mb-8">
          <NewsletterForm />
        </div>

        <footer className="pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground">
              Ready to build your own AI agent?
            </p>
            <Link to="/">
              <Button>Get Started with jeesi.ai</Button>
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}

function formatMarkdown(content: string): string {
  let html = content
    // Horizontal rules
    .replace(/^---+$/gm, '<hr class="my-10 border-border" />')
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-foreground mt-8 mb-4">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-foreground mt-10 mb-5 pb-2 border-b border-border">$1</h2>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/30 rounded-r-lg italic text-muted-foreground">$1</blockquote>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">$1</code>')
    // Lists with checkmarks
    .replace(/^- ✅ (.*$)/gm, '<li class="flex items-start gap-2 mb-2"><span class="text-green-500 mt-1">✅</span><span class="text-muted-foreground">$1</span></li>')
    .replace(/^- ❌ (.*$)/gm, '<li class="flex items-start gap-2 mb-2"><span class="text-red-500 mt-1">❌</span><span class="text-muted-foreground">$1</span></li>')
    // Regular lists
    .replace(/^- (.*$)/gm, '<li class="text-muted-foreground mb-2 ml-4 list-disc">$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.*$)/gm, '<li class="text-muted-foreground mb-2 ml-4 list-decimal">$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="text-muted-foreground leading-relaxed mb-5">')
    // Clean up list wrapping
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => {
      if (match.includes('list-disc') || match.includes('flex items-start')) {
        return `<ul class="my-5 space-y-1">${match}</ul>`;
      }
      if (match.includes('list-decimal')) {
        return `<ol class="my-5 space-y-1">${match}</ol>`;
      }
      return match;
    });

  // Handle tables
  html = html.replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (match, header, body) => {
    const headers = header.split('|').filter((c: string) => c.trim()).map((c: string) => 
      `<th class="px-4 py-3 text-left font-semibold text-foreground bg-muted/50">${c.trim()}</th>`
    ).join('');
    const rows = body.trim().split('\n').map((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) => 
        `<td class="px-4 py-3 text-muted-foreground border-t border-border">${c.trim()}</td>`
      ).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<div class="my-6 overflow-x-auto"><table class="w-full border border-border rounded-lg overflow-hidden"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
  });

  // Wrap in initial paragraph
  if (!html.startsWith('<')) {
    html = `<p class="text-muted-foreground leading-relaxed mb-5">${html}`;
  }
  if (!html.endsWith('>')) {
    html = `${html}</p>`;
  }

  // Clean up empty paragraphs and fix nesting
  html = html
    .replace(/<p[^>]*><\/p>/g, '')
    .replace(/<p[^>]*>(\s*<(?:h[1-6]|ul|ol|blockquote|hr|div|table))/g, '$1')
    .replace(/(<\/(?:h[1-6]|ul|ol|blockquote|hr|div|table)>)\s*<\/p>/g, '$1')
    .replace(/<p[^>]*>\s*<hr/g, '<hr')
    .replace(/hr[^>]*>\s*<\/p>/g, 'hr class="my-10 border-border" />');

  return html;
}
