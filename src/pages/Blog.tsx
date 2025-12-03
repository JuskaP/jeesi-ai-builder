import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: "ai-agents-future-of-business",
    title: "Why AI Agents Are the Future of Every Business",
    excerpt: "Discover how AI agents are revolutionizing the way businesses operate, from automating repetitive tasks to providing 24/7 customer support.",
    category: "AI Insights",
    readTime: "6 min read",
    date: "December 2, 2025",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60"
  },
  {
    slug: "founders-guide-ai-delegation",
    title: "The Founder's Guide to AI Delegation: Work Smarter, Not Harder",
    excerpt: "Learn how successful founders are leveraging AI agents to reclaim their time and focus on what truly matters—growing their business.",
    category: "Entrepreneurship",
    readTime: "8 min read",
    date: "December 1, 2025",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60"
  },
  {
    slug: "getting-started-jeesi-ai",
    title: "Getting Started with jeesi.ai: Build Your First AI Agent in Minutes",
    excerpt: "A step-by-step guide to creating, customizing, and deploying your first AI agent using jeesi.ai's intuitive platform.",
    category: "Tutorial",
    readTime: "5 min read",
    date: "November 30, 2025",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60"
  },
  {
    slug: "implementing-jeesi-ai-business",
    title: "How to Implement jeesi.ai in Your Business: A Complete Strategy Guide",
    excerpt: "From identifying use cases to measuring ROI, this comprehensive guide shows you how to successfully integrate AI agents into your operations.",
    category: "Strategy",
    readTime: "10 min read",
    date: "November 28, 2025",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60"
  }
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, tutorials, and strategies to help you harness the power of AI agents for your business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                      Read <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 max-w-xl mx-auto">
          <NewsletterForm />
        </div>
      </div>
    </div>
  );
}
