import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Input, Textarea } from '@/components/ui';

const API_URL = 'https://money-management-backend-f6dg.onrender.com/api/posts';
const AUTH_TOKEN = localStorage.getItem('authToken') || '';

export default function PostsManagementPage() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({
    id: '',
    title: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    content: '',
  });

  const fetchPosts = async () => {
    try {
      const res = await axios.get(API_URL);
      setPosts(res.data.docs);
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (form.id) {
        await axios.patch(`${API_URL}/${form.id}`, form, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });
        alert('Post updated!');
      } else {
        await axios.post(API_URL, form, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });
        alert('Post created!');
      }
      setForm({ id: '', title: '', slug: '', metaTitle: '', metaDescription: '', content: '' });
      fetchPosts();
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

  const handleEdit = (post) => {
    setForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      content: post.content,
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });
        fetchPosts();
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Post Management</h1>

      <div className="grid gap-4 mb-6">
        <Input placeholder="Title" name="title" value={form.title} onChange={handleChange} />
        <Input placeholder="Slug (e.g. my-post)" name="slug" value={form.slug} onChange={handleChange} />
        <Input placeholder="Meta Title" name="metaTitle" value={form.metaTitle} onChange={handleChange} />
        <Textarea placeholder="Meta Description" name="metaDescription" value={form.metaDescription} onChange={handleChange} />
        <Textarea placeholder="Article Content (HTML or plain text)" name="content" rows={10} value={form.content} onChange={handleChange} />
        <Button onClick={handleSubmit}>{form.id ? 'Update' : 'Create'} Article</Button>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-2">Existing Articles</h2>
      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.id} className="border p-4 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <strong>{post.title}</strong>
                <p className="text-gray-500 text-sm">/blog/{post.slug}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(post)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDelete(post.id)}>Delete</Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}