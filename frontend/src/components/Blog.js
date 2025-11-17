import React from 'react';
import { Link } from 'react-router-dom';

const blogPosts = [
  { id: 1, title: 'The Future of Financial Document Management: AI-Powered Automation' },
  { id: 2, title: 'Unlocking Business Intelligence: How AI is Revolutionizing Financial Analysis' },
  { id: 3, title: 'The Security Imperative: Why AI-Powered Document Management is Safer Than You Think' },
  { id: 4, title: 'From Chaos to Clarity: How AI-Powered Categorization is Transforming Expense Management' },
  { id: 5, title: 'The Power of Predictive Analytics: How AI is Helping Businesses See Around the Corner' },
  { id: 6, title: 'The Human-in-the-Loop: Why AI and Human Expertise are a Winning Combination' },
  { id: 7, title: 'The Democratization of Data: How AI is Leveling the Playing Field for Small Businesses' },
  { id: 8, title: 'Beyond the Hype: Practical Steps for Implementing AI in Your Financial Workflow' },
];

const Blog = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Blog</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.id}`}
            className="p-6 border rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            <p className="text-blue-500">Read more &rarr;</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blog;