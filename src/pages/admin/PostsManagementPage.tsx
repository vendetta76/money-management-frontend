import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const API_URL = 'https://money-management-backend-f6dg.onrender.com/api/posts';
const AUTH_TOKEN = typeof window !== 'undefined' ? localStorage.getItem('authToken') || '' : '';

export default function PostsManagementPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [form, setForm] = useState({
    id: '',
    title: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setPosts(res.data.docs);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && !form.id ? { slug: value.toLowerCase().replace(/\s+/g, '-') } : {})
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (form.id) {
        await axios.patch(`${API_URL}/${form.id}`, form, {
          headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
        });
        toast.success('Post updated successfully');
      } else {
        await axios.post(API_URL, form, {
          headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
        });
        toast.success('Post created successfully');
      }
      setForm({ id: '', title: '', slug: '', metaTitle: '', metaDescription: '', content: '' });
      fetchPosts();
    } catch (err) {
      setError('Error saving post');
      toast.error('Error saving post');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: any) => {
    setForm(post);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
        });
        toast.success('Post deleted successfully');
        fetchPosts();
      } catch (err) {
        setError('Error deleting post');
        toast.error('Error deleting post');
      } finally {
        setLoading(false);
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
        <Button onClick={handleSubmit} disabled={loading}>
          {form.id ? 'Update' : 'Create'} Article
        </Button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <h2 className="text-xl font-semibold mt-8 mb-2">Existing Articles</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
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
      )}
    </div>
  );
}